const express = require('express');
const { getExpenses, postExpense, putExpense, deleteExpenseHandler } = require('./expense.controller');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', postExpense);
router.put('/:id', putExpense);
router.delete('/:id', deleteExpenseHandler);

module.exports = router;

