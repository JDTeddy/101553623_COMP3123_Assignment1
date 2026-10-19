const logger = require("../utils/logger");

// Application-level middleware that logs ONE line per request.
// Request bodies and headers are NOT logged, so passwords and tokens can never end up in the log.
module.exports = (req, res, next) => {
  const start = Date.now();

  // "finish" fires when the response has been sent, so we know the final status code
  res.on("finish", () => {
    let level = "info";
    if (res.statusCode >= 500) level = "error";
    else if (res.statusCode >= 400) level = "warn";

    logger[level]("http.request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userId: req.user ? String(req.user._id) : undefined,
    });
  });

  next();
};