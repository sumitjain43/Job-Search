const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    keywords: [String],
    locations: [String],
    jobTypes: [String],
    minSalary: {
      type: Number,
      default: 0,
    },
    remoteOnly: {
      type: Boolean,
      default: false,
    },
    excludedCompanies: [String],
    autoApply: {
      type: Boolean,
      default: false,
    },
    maxApplicationsPerDay: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("preferences", schema);

