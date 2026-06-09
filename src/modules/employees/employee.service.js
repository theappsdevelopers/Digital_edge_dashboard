const { getModel } = require('../../config/requestContext');

async function listEmployees() {
  const Employee = getModel('Employee');
  return Employee.find({}).lean();
}

/**
 * Create employee. Body: name, role, department, employment_type, monthly_cost, start_date, end_date, status, email (snake_case).
 */
async function createEmployee(body) {
  const Employee = getModel('Employee');
  const doc = {
    name: body.name,
    role: body.role,
    department: body.department,
    employmentType: body.employment_type,
    monthlyCost: body.monthly_cost,
    startDate: body.start_date,
    endDate: body.end_date || undefined,
    status: body.status ?? 'Active',
    email: body.email,
  };
  const employee = await Employee.create(doc);
  return employee.toObject();
}

/**
 * Update employee by id. Same body shape as create.
 */
async function updateEmployee(id, body) {
  const Employee = getModel('Employee');
  const update = {
    name: body.name,
    role: body.role,
    department: body.department,
    employmentType: body.employment_type,
    monthlyCost: body.monthly_cost,
    startDate: body.start_date,
    endDate: body.end_date || undefined,
    status: body.status ?? 'Active',
    email: body.email,
  };
  const employee = await Employee.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  return employee;
}

async function deleteEmployee(id) {
  const Employee = getModel('Employee');
  const employee = await Employee.findByIdAndDelete(id);
  return employee;
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
