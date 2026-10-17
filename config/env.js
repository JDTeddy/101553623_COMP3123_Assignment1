const dotenv = require("dotenv");
dotenv.config({ quiet: true }); // quiet: true hides dotenv's tip message in the console

module.exports = {
  serverPort: process.env.SERVER_PORT || 3000,
};