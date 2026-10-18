const Employee = require("../models/employee");
const httpError = require("../utils/httpError");

async function findEmployee(eid) {
  const employee = await Employee.findById(eid);
  if (!employee) throw httpError(404, "Employee not found.");
  return employee;
}

// GET /api/v1/emp/employees -> 200
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ created_at: -1 });
    res.status(200).json(employees);
  } catch (err) {
    next(err); // hand the error to the error-handling middleware
  }
};

// POST /api/v1/emp/employees -> 201
exports.createEmployee = async (req, res, next) => {
  try {
    const employee = new Employee(req.validated);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/emp/employees/:eid -> 200
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await findEmployee(req.params.eid);
    res.status(200).json(employee);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/emp/employees/:eid -> 200
exports.updateEmployee = async (req, res, next) => {
  try {
    if (Object.keys(req.validated).length === 0) {
      throw httpError(400, "Provide at least one employee field to update.");
    }
    const employee = await findEmployee(req.params.eid);
    employee.set(req.validated); // only whitelisted, validated fields
    const savedEmployee = await employee.save();
    res.status(200).json(savedEmployee);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/emp/employees?eid=xxx -> 204
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await findEmployee(req.query.eid);
    await employee.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};