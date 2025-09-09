const express = require("express");
const axios = require("axios");
const jwtAuth = require("../lib/jwtAuth");
const pdfParse = require("pdf-parse");

const Preference = require("../db/Preference");
const Job = require("../db/Job");
const Application = require("../db/Application");

const { extractProfileFromResume, generateSOP, chatWithAssistant } = require("../lib/aiProvider");

const router = express.Router();

// AI chat endpoint
router.post("/chat", jwtAuth, async (req, res) => {
  try {
    const { history = [], message = "" } = req.body || {};
    const reply = await chatWithAssistant(history, message);
    res.json({ reply });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Extract profile fields from resume (supports resumeUrl or raw resumeText)
router.post("/extract-profile", jwtAuth, async (req, res) => {
  try {
    const { resumeUrl, resumeText } = req.body || {};
    let text = resumeText || "";
    if (!text && resumeUrl) {
      const resp = await axios.get(resumeUrl, { responseType: "arraybuffer" });
      const pdfData = await pdfParse(Buffer.from(resp.data));
      text = pdfData.text || "";
    }
    if (!text) return res.status(400).json({ message: "Provide resumeText or resumeUrl" });
    const extracted = await extractProfileFromResume(text);
    res.json(extracted);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Recommend jobs using preferences and simple matching
router.get("/recommend-jobs", jwtAuth, async (req, res) => {
  try {
    if (req.user.type !== "applicant") {
      return res.status(401).json({ message: "Only applicants get recommendations" });
    }
    const prefs = await Preference.findOne({ userId: req.user._id });
    const keywords = (prefs?.keywords || []).filter(Boolean);
    const jobTypes = (prefs?.jobTypes || []).filter(Boolean);
    const minSalary = prefs?.minSalary || 0;

    const findParams = {};
    if (keywords.length) {
      findParams["$or"] = [
        { title: { $regex: new RegExp(keywords.join("|"), "i") } },
        { skillsets: { $in: keywords } },
      ];
    }
    if (jobTypes.length) {
      findParams.jobType = { $in: jobTypes };
    }
    if (minSalary > 0) {
      findParams.salary = { $gte: minSalary };
    }

    const jobs = await Job.find(findParams).sort({ rating: -1, dateOfPosting: -1 }).limit(50);
    res.json(jobs);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Trigger auto-apply for current user (one-off)
router.post("/auto-apply", jwtAuth, async (req, res) => {
  try {
    if (req.user.type !== "applicant") {
      return res.status(401).json({ message: "Only applicants can auto-apply" });
    }
    const applied = await runAutoApplyForUser(req.user);
    res.json({ message: `Auto-applied to ${applied} jobs` });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Generate SOP for a specific job and user context
router.post("/generate-sop", jwtAuth, async (req, res) => {
  try {
    const { jobTitle = "", companyName = "", userName = "", userSkills = [] } = req.body || {};
    const sop = await generateSOP({ jobTitle, companyName, userName, userSkills });
    res.json({ sop });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

async function runAutoApplyForUser(user) {
  const prefs = await Preference.findOne({ userId: user._id });
  if (!prefs || !prefs.autoApply) return 0;

  const keywords = (prefs.keywords || []).filter(Boolean);
  const jobTypes = (prefs.jobTypes || []).filter(Boolean);
  const minSalary = prefs.minSalary || 0;

  const findParams = {};
  if (keywords.length) {
    findParams["$or"] = [
      { title: { $regex: new RegExp(keywords.join("|"), "i") } },
      { skillsets: { $in: keywords } },
    ];
  }
  if (jobTypes.length) {
    findParams.jobType = { $in: jobTypes };
  }
  if (minSalary > 0) {
    findParams.salary = { $gte: minSalary };
  }

  const jobs = await Job.find(findParams).limit(10);
  let success = 0;
  for (const job of jobs) {
    const existing = await Application.findOne({ userId: user._id, jobId: job._id, status: { $nin: ["deleted", "accepted", "cancelled"] } });
    if (existing) continue;
    const sop = await generateSOP({ jobTitle: job.title, companyName: "", userName: user.email.split("@")[0], userSkills: keywords });
    try {
      const application = new Application({
        userId: user._id,
        recruiterId: job.userId,
        jobId: job._id,
        status: "applied",
        sop,
      });
      await application.save();
      success += 1;
    } catch (e) {
      // skip
    }
  }
  return success;
}

module.exports = router;

