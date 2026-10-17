const crypto = require("crypto");
const httpError = require("../utils/httpError");

// TEMPORARY in-memory "database"
// will be replaced later and connected to MongoDB
let employees = [];

// 24 hex characters = the same shape as a MongoDB ObjectId, so the API will not change when we switch to MongoDB.
const newId = () => crypto.randomBytes(12).toString("hex");

function findEmployee(eid) {
  const employee = employees.find((e) => e._id === eid);
  if (!employee) throw httpError(404, "Employee not found."); // Express 5 passes thrown errors to the error handler
  return employee;
}

// GET /api/v1/emp/employees -> 200
exports.getAllEmployees = (req, res) => {
  res.status(200).json(employees);
};

// POST /api/v1/emp/employees -> 201
exports.createEmployee = (req, res) => {
  const now = new Date();
  // req.validated only contains the fields that passed validation (see middleware/validate.js)
  const employee = Object.assign({ _id: newId(), created_at: now, updated_at: now }, req.validated);
  employees.push(employee);
  res.status(201).json(employee);
};

// GET /api/v1/emp/employees/:eid -> 200
exports.getEmployeeById = (req, res) => {
  res.status(200).json(findEmployee(req.params.eid));
};

// PUT /api/v1/emp/employees/:eid -> 200
exports.updateEmployee = (req, res) => {
  if (Object.keys(req.validated).length === 0) {
    throw httpError(400, "Provide at least one employee field to update.");
  }
  const employee = findEmployee(req.params.eid);
  Object.assign(employee, req.validated); // only whitelisted, validated fields
  employee.updated_at = new Date();
  res.status(200).json(employee);
};

// DELETE /api/v1/emp/employees?eid=xxx -> 204
exports.deleteEmployee = (req, res) => {
  const employee = findEmployee(req.query.eid);
  employees = employees.filter((e) => e !== employee);
  res.status(204).send();
};