const Preference = require("../db/Preference");
const Job = require("../db/Job");
const Application = require("../db/Application");
const { generateSOP } = require("../lib/aiProvider");

module.exports = async function runAutoApply() {
  const prefsList = await Preference.find({ autoApply: true });
  let totalApplied = 0;
  for (const prefs of prefsList) {
    const userId = prefs.userId;
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

    const jobs = await Job.find(findParams).limit(prefs.maxApplicationsPerDay || 5);

    for (const job of jobs) {
      const existing = await Application.findOne({ userId, jobId: job._id, status: { $nin: ["deleted", "accepted", "cancelled"] } });
      if (existing) continue;
      const sop = await generateSOP({ jobTitle: job.title, companyName: "", userName: "Applicant", userSkills: keywords });
      try {
        const application = new Application({
          userId,
          recruiterId: job.userId,
          jobId: job._id,
          status: "applied",
          sop,
        });
        await application.save();
        totalApplied += 1;
      } catch (e) {
        // continue
      }
    }
  }
  return totalApplied;
};

