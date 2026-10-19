const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./src/config/env");
const connectDB = require("./src/config/db");
const { apiLimiter } = require("./src/middleware/rateLimiters");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");
const userRoutes = require("./src/routes/user");
const employeeRoutes = require("./src/routes/employee");
const logger = require("./src/utils/logger");
const requestLogger = require("./src/middleware/requestLogger");

const app = express();

// Helmet adds security-related HTTP headers
app.use(helmet());

// Application-level middleware: print every request
app.use(requestLogger);

// Parse JSON request bodies (and cap the size)
app.use(express.json({ limit: "10kb" }));

// http://localhost:3000/
app.get("/", (req, res) => {
  res.send("<h1>Employee API is running</h1>");
});

// http://localhost:3000/health
app.get("/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    status: "ok",
    service: "comp3123-assignment1-api",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || "unknown",
  });
});

// General rate limit for everything under /api (the health check above is NOT limited)
app.use("/api", apiLimiter);

// User routes: /api/v1/user/signup and /login
app.use("/api/v1/user", userRoutes);

// Employee routes: /api/v1/emp/employees
app.use("/api/v1/emp", employeeRoutes);

// These two MUST stay last
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB first, THEN start accepting requests
connectDB()
  .then(() => {
    app.listen(config.serverPort, () => {
      logger.info("server.started", { port: config.serverPort });
    });
  })
  .catch((err) => {
    logger.error("server.start_failed", { message: err.message });
    process.exit(1);
  });