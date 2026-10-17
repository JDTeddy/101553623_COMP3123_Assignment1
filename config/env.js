const dotenv = require("dotenv");
dotenv.config({ quiet: true }); // quiet: true hides dotenv's tip message in the console

// Stop right away if a required setting is missing
const missing = ["MONGODB_URI"].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  serverPort: process.env.SERVER_PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
};