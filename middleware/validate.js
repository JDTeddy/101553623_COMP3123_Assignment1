const { validationResult, matchedData } = require("express-validator");
const httpError = require("../utils/httpError");

// Runs AFTER the express-validator rules. Rejects with 400, or exposes ONLY the validated/sanitized fields.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path || "request", message: e.msg }));
    return next(httpError(400, "Validation failed", errors));
  }
  req.validated = matchedData(req, { locations: ["body"] });
  next();
};