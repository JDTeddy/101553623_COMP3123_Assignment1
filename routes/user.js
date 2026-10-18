const express = require("express");
const userController = require("../controllers/user");
const validate = require("../middleware/validate");
const { signupRules, loginRules } = require("../validators/user");
const { signupLimiter, loginLimiter } = require("../middleware/rateLimiters");

const routes = express.Router();

routes.post("/signup", signupLimiter, signupRules, validate, userController.signup);
routes.post("/login", loginLimiter, loginRules, validate, userController.login);

module.exports = routes;