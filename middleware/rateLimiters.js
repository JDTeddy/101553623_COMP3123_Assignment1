const rateLimit = require("express-rate-limit");
const config = require("../config/env");
const logger = require("../utils/logger");

const makeHandler = (name) => (req, res) => {
  logger.warn("rate_limit.exceeded", { limiter: name, method: req.method, path: req.originalUrl, ip: req.ip });
  res.status(429).json({
    status: false,
    error: true,
    code: 429,
    message: "Too many requests. Please try again later.",
    date: new Date().toISOString(),
  });
};

const makeLimiter = (name, limit) =>
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: makeHandler(name),
  });

exports.signupLimiter = makeLimiter("signup", config.authRateLimitMax);
exports.loginLimiter = makeLimiter("login", config.authRateLimitMax);
exports.apiLimiter = makeLimiter("api", config.apiRateLimitMax);