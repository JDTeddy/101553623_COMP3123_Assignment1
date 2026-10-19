const { body } = require("express-validator");

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

exports.signupRules = [
  body("username")
    .exists().withMessage("username is required").bail()
    .isString().withMessage("username must be a string").bail()
    .trim().toLowerCase()
    .isLength({ min: 3, max: 30 }).withMessage("username must be 3-30 characters")
    .matches(/^[a-z0-9_]+$/).withMessage("username may only contain letters, numbers and underscores"),
  body("email")
    .exists().withMessage("email is required").bail()
    .isString().withMessage("email must be a string").bail()
    .trim().toLowerCase()
    .isLength({ max: 254 }).withMessage("email is too long")
    .isEmail().withMessage("email format is invalid"),
  body("password")
    .exists().withMessage("password is required").bail()
    .isString().withMessage("password must be a string").bail()
    .isLength({ min: 8, max: 72 }).withMessage("password must be 8-72 characters") // 72 = bcrypt's limit
    .matches(PASSWORD_RULE).withMessage("password must contain an uppercase letter, a lowercase letter and a number"),
];

// Login accepts username + password OR email + password.
// isString() also blocks NoSQL-injection payloads such as {"username": {"$gt": ""}}.
exports.loginRules = [
  body("username").optional().isString().withMessage("username must be a string").bail().trim().toLowerCase().isLength({ min: 1, max: 254 }),
  body("email").optional().isString().withMessage("email must be a string").bail().trim().toLowerCase().isLength({ min: 1, max: 254 }),
  body("password")
    .exists().withMessage("password is required").bail()
    .isString().withMessage("password must be a string").bail()
    .isLength({ min: 1, max: 72 }).withMessage("password is required"),
  body().custom((value, { req }) => {
    if (!req.body || (!req.body.username && !req.body.email)) {
      throw new Error("username or email is required");
    }
    return true;
  }),
];