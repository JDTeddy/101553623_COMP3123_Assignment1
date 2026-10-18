const rateLimit = require("express-rate-limit");
const config = require("../config/env");

// What to send when a client goes over the limit (same shape as our other errors)
const handler = (req, res) => {
  res.status(429).json({
    status: false,
    error: true,
    code: 429,
    message: "Too many requests. Please try again later.",
    date: new Date().toISOString(),
  });
};

const makeLimiter = (limit) =>
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: limit,
    standardHeaders: "draft-7", // sends RateLimit-* headers so clients can see their quota
    legacyHeaders: false,
    handler: handler,
  });

// Strict limits on credential endpoints (brute-force / account-spam protection). Each has its own counter.
exports.signupLimiter = makeLimiter(config.authRateLimitMax);
exports.loginLimiter = makeLimiter(config.authRateLimitMax);
// Looser limit for all other API traffic
exports.apiLimiter = makeLimiter(config.apiRateLimitMax);