const { validationResult, matchedData } = require("express-validator");
const httpError = require("../utils/httpError");
const logger = require("../utils/logger");

// Runs AFTER the express-validator rules. Rejects with 400, or exposes ONLY the validated/sanitized fields.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path || "request", message: e.msg }));
    // Log the field names only, never the submitted values (they could contain passwords)
    logger.warn("validation.failed", { method: req.method, path: req.originalUrl, fields: errors.map((e) => e.field) });
    return next(httpError(400, "Validation failed", errors));
  }
  req.validated = matchedData(req, { locations: ["body"] });
  next();
};