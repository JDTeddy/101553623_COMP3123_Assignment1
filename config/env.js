const dotenv = require("dotenv");
dotenv.config({ quiet: true }); // quiet: true hides dotenv's tip message in the console

// Stop right away if a required setting is missing
const missing = ["MONGODB_URI", "JWT_SECRET"].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters long.");
  process.exit(1);
}

// Turn a text setting into a number (fall back to a default if it is missing or not a number)
const toNumber = (value, fallback) => {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? fallback : number;
};

module.exports = {
  serverPort: process.env.SERVER_PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  authRateLimitMax: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 10),
  apiRateLimitMax: toNumber(process.env.API_RATE_LIMIT_MAX, 100),
  logDir: process.env.LOG_DIR || "logs",
};