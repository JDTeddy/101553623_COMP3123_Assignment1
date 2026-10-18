const mongoose = require("mongoose");
const config = require("./env");
const logger = require("../utils/logger");

// It returns the Promise so server.js can wait for it.
function connectDB() {
  return mongoose.connect(config.mongodbUri).then(() => {
    logger.info("database.connected", { name: mongoose.connection.name });
  });
}

module.exports = connectDB;