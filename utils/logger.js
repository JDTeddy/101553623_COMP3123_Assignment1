const fs = require("fs");
const path = require("path");
const config = require("../config/env");

// The log files live in the "logs" folder in the project root
const LOG_DIR = path.resolve(__dirname, "..", config.logDir);
fs.mkdirSync(LOG_DIR, { recursive: true });

const APP_LOG = path.join(LOG_DIR, "app.log"); // every event
const ERROR_LOG = path.join(LOG_DIR, "error.log"); // errors only

// fs.appendFile is a callback function: it adds text to the END of a file
function onWriteError(err) {
  if (err) console.error("Could not write to the log file:", err.message);
}

function writeLog(level, event, details) {
  const entry = Object.assign({ timestamp: new Date().toISOString(), level: level, event: event }, details);
  const line = JSON.stringify(entry) + "\n"; // one JSON object per line

  console.log(`${entry.timestamp} ${level.toUpperCase()} ${event}`, details ? JSON.stringify(details) : "");
  fs.appendFile(APP_LOG, line, onWriteError);
  if (level === "error") {
    fs.appendFile(ERROR_LOG, line, onWriteError);
  }
}

// NOTE: never pass passwords, tokens or secrets into these functions.
exports.info = (event, details) => writeLog("info", event, details);
exports.warn = (event, details) => writeLog("warn", event, details);
exports.error = (event, details) => writeLog("error", event, details);