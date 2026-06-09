const express = require('express');
const { getEmployees, postEmployee, putEmployee, deleteEmployeeHandler } = require('./employee.controller');

const router = express.Router();

router.get('/', getEmployees);
router.post('/', postEmployee);
router.put('/:id', putEmployee);
router.delete('/:id', deleteEmployeeHandler);

module.exports = router;
