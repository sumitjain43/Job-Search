const express = require("express");
const jwtAuth = require("../lib/jwtAuth");

const Preference = require("../db/Preference");

const router = express.Router();

// Get my preferences (applicants only)
router.get("/preferences", jwtAuth, async (req, res) => {
  try {
    if (req.user.type !== "applicant") {
      return res.status(401).json({ message: "Only applicants have preferences" });
    }
    let prefs = await Preference.findOne({ userId: req.user._id });
    if (!prefs) {
      prefs = new Preference({ userId: req.user._id });
      await prefs.save();
    }
    res.json(prefs);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update my preferences
router.put("/preferences", jwtAuth, async (req, res) => {
  try {
    if (req.user.type !== "applicant") {
      return res.status(401).json({ message: "Only applicants can update preferences" });
    }
    const update = req.body || {};
    const prefs = await Preference.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { upsert: true, new: true }
    );
    res.json({ message: "Preferences updated", preferences: prefs });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

