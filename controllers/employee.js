const Employee = require("../models/employee");
const httpError = require("../utils/httpError");

/*
 OWNERSHIP ENFORCEMENT
 The database query filters by BOTH the employee id AND the logged-in user's id,
 so another user's document can never be loaded, whatever eid the client sends.
 The extra exists() lookup only decides WHICH error to send:
 403 = the employee exists but belongs to someone else
 404 = the employee does not exist at all
*/

async function findOwnedEmployee(eid, req) {
  const employee = await Employee.findOne({ _id: eid, user: req.user._id });
  if (employee) return employee;

  if (await Employee.exists({ _id: eid })) {
    throw httpError(403, "You do not have permission to access this employee.");
  }
  throw httpError(404, "Employee not found.");
}

// GET /api/v1/emp/employees -> 200 (only the logged-in user's employees)
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ user: req.user._id }).sort({ created_at: -1 });
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/emp/employees -> 201
exports.createEmployee = async (req, res, next) => {
  try {
    const employee = new Employee(req.validated);
    // The owner comes from the verified token (req.user), NEVER from the request body
    employee.user = req.user._id;
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/emp/employees/:eid -> 200
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await findOwnedEmployee(req.params.eid, req);
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
    const employee = await findOwnedEmployee(req.params.eid, req);
    employee.set(req.validated); // only whitelisted fields, so "user" can never be reassigned
    const savedEmployee = await employee.save();
    res.status(200).json(savedEmployee);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/emp/employees?eid=xxx -> 204
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await findOwnedEmployee(req.query.eid, req);
    await employee.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};