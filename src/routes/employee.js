const express = require("express");
const authenticateToken = require("../middleware/auth");
const employeeController = require("../controllers/employee");
const validate = require("../middleware/validate");
const {
  createEmployeeRules, updateEmployeeRules, eidParamRule, eidQueryRule,
} = require("../validators/employee");

const routes = express.Router();

// every employee route below now requires a valid JWT
routes.use(authenticateToken);
routes.get("/employees", employeeController.getAllEmployees);
routes.post("/employees", createEmployeeRules, validate, employeeController.createEmployee);
routes.get("/employees/:eid", eidParamRule, validate, employeeController.getEmployeeById);
routes.put("/employees/:eid", eidParamRule, updateEmployeeRules, validate, employeeController.updateEmployee);
routes.delete("/employees", eidQueryRule, validate, employeeController.deleteEmployee); // ?eid=xxx

module.exports = routes;