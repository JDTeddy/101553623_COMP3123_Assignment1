const { body, param, query } = require("express-validator");

const NAME_RULE = /^[\p{L}\p{M}' .-]+$/u;

// Builds the rules for every employee field. required=true for POST, false for PUT (partial update).
const employeeFields = (required) => {
  const start = (field) => {
    const chain = body(field);
    return required
      ? chain.exists().withMessage(`${field} is required`).bail()
      : chain.optional();
  };
  const text = (field, min, max) =>
    start(field)
      .isString().withMessage(`${field} must be a string`).bail()
      .trim()
      .isLength({ min, max }).withMessage(`${field} must be ${min}-${max} characters`);

  return [
    text("first_name", 1, 50).matches(NAME_RULE).withMessage("first_name contains invalid characters"),
    text("last_name", 1, 50).matches(NAME_RULE).withMessage("last_name contains invalid characters"),
    start("email")
      .isString().withMessage("email must be a string").bail()
      .trim().toLowerCase()
      .isLength({ max: 254 }).withMessage("email is too long")
      .isEmail().withMessage("email format is invalid"),
    text("position", 2, 100),
    text("department", 2, 100),
    start("salary")
      .custom((v) => ["number", "string"].includes(typeof v)).withMessage("salary must be a number").bail()
      .isFloat({ gt: 0, max: 1e9 }).withMessage("salary must be a positive number")
      .toFloat(),
    start("date_of_joining")
      .isString().withMessage("date_of_joining must be a date string (e.g. 2025-01-31)").bail()
      .isISO8601({ strict: true, strictSeparator: true }).withMessage("date_of_joining must be a valid ISO 8601 date")
      .toDate(),
  ];
};

exports.createEmployeeRules = employeeFields(true);
exports.updateEmployeeRules = employeeFields(false);

exports.eidParamRule = [
  param("eid").isMongoId().withMessage("eid must be a valid MongoDB ObjectId"),
];

// DELETE /employees?eid=xxx  (the typeof check rejects ?eid=a&eid=b arrays)
exports.eidQueryRule = [
  query("eid")
    .exists().withMessage("eid query parameter is required").bail()
    .custom((v) => typeof v === "string").withMessage("eid must be a single value").bail()
    .isMongoId().withMessage("eid must be a valid MongoDB ObjectId"),
];