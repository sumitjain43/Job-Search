require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportConfig = require("./lib/passportConfig");
const cors = require("cors");
const fs = require("fs");
const cron = require("node-cron");

// MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "job_portal";
mongoose
.connect(mongoUri, {
    dbName: dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// initialising directories
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/resume")) {
  fs.mkdirSync("./public/resume");
}
if (!fs.existsSync("./public/profile")) {
  fs.mkdirSync("./public/profile");
}

const app = express();
const port = parseInt(process.env.BACKEND_PORT || "4444", 10);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Setting up middlewares
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(passportConfig.initialize());

// Routing
app.use("/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/apiRoutes"));
app.use("/api", require("./routes/preferencesRoutes"));
app.use("/ai", require("./routes/aiRoutes"));
app.use("/upload", require("./routes/uploadRoutes"));
app.use("/host", require("./routes/downloadRoutes"));

// Schedule auto-apply worker
const schedule = process.env.AUTO_APPLY_CRON || "0 */6 * * *"; // every 6 hours
try {
  const runAutoApply = require("./worker/autoApply");
  cron.schedule(schedule, async () => {
    console.log("⏰ Running scheduled auto-apply task");
    try {
      await runAutoApply();
      console.log("✅ Auto-apply run completed");
    } catch (err) {
      console.error("❌ Auto-apply run failed:", err);
    }
  });
} catch (e) {
  console.warn("Auto-apply worker not loaded:", e.message);
}

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
