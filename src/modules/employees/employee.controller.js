const mongoose = require('mongoose');
const { listEmployees, createEmployee, updateEmployee, deleteEmployee } = require('./employee.service');

function toEmployeeResponse(e) {
  return {
    id: String(e._id),
    name: e.name,
    role: e.role,
    department: e.department,
    employment_type: e.employmentType,
    monthly_cost: e.monthlyCost,
    start_date: e.startDate,
    end_date: e.endDate,
    status: e.status,
    email: e.email,
  };
}

async function getEmployees(req, res) {
  try {
    const employees = await listEmployees();
    res.json(employees.map(toEmployeeResponse));
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

async function postEmployee(req, res) {
  try {
    const { name, role, employment_type, monthly_cost, start_date } = req.body || {};
    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' });
    }
    if (!employment_type) {
      return res.status(400).json({ error: 'employment_type is required' });
    }
    if (monthly_cost == null || typeof monthly_cost !== 'number') {
      return res.status(400).json({ error: 'monthly_cost (number) is required' });
    }
    if (!start_date) {
      return res.status(400).json({ error: 'start_date is required' });
    }
    const employee = await createEmployee(req.body);
    res.status(201).json(toEmployeeResponse(employee));
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
}

async function putEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid employee id is required' });
    }
    const { name, role, employment_type, monthly_cost, start_date } = req.body || {};
    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' });
    }
    if (!employment_type) {
      return res.status(400).json({ error: 'employment_type is required' });
    }
    if (monthly_cost == null || typeof monthly_cost !== 'number') {
      return res.status(400).json({ error: 'monthly_cost (number) is required' });
    }
    if (!start_date) {
      return res.status(400).json({ error: 'start_date is required' });
    }
    const employee = await updateEmployee(id, req.body);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(toEmployeeResponse(employee));
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
}

async function deleteEmployeeHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid employee id is required' });
    }
    const employee = await deleteEmployee(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
}

module.exports = {
  getEmployees,
  postEmployee,
  putEmployee,
  deleteEmployeeHandler,
};
