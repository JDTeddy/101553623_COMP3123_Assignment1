const express = require("express");
const userController = require("../controllers/user");
const validate = require("../middleware/validate");
const { signupRules } = require("../validators/user");

const routes = express.Router();

routes.post("/signup", signupRules, validate, userController.signup);

module.exports = routes;