const express = require("express");
const userController = require("../controllers/user");
const validate = require("../middleware/validate");
const { signupRules, loginRules } = require("../validators/user");

const routes = express.Router();

routes.post("/signup", signupRules, validate, userController.signup);
routes.post("/login", loginRules, validate, userController.login);

module.exports = routes;