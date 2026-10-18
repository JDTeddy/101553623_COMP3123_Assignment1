const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./config/env");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employee");

const app = express();

// Helmet adds security-related HTTP headers
app.use(helmet());

// Application-level middleware: print every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

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
      console.log(`Server is running on http://localhost:${config.serverPort}/`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });