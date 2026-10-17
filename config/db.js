const mongoose = require("mongoose");
const config = require("./env");

// It returns the Promise so server.js can wait for it.
function connectDB() {
  return mongoose.connect(config.mongodbUri).then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  });
}

module.exports = connectDB;