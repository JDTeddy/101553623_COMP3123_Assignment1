const express = require("express");
const employeeController = require("../controllers/employee");

const routes = express.Router();

routes.get("/employees", employeeController.getAllEmployees);
routes.post("/employees", employeeController.createEmployee);
routes.get("/employees/:eid", employeeController.getEmployeeById);
routes.put("/employees/:eid", employeeController.updateEmployee);
routes.delete("/employees", employeeController.deleteEmployee); // eid comes from the query string: ?eid=xxx

module.exports = routes;