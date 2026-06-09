const mongoose = require('mongoose');
const { listExpenses, createExpense, updateExpense, deleteExpense } = require('./expense.service');

function toExpenseResponse(e) {
  return {
    id: String(e._id),
    expense_type: e.expenseType,
    category: e.category,
    amount: e.amount,
    date: e.date,
    month: e.month,
    quarter: e.quarter,
    year: e.year,
    vendor: e.vendor,
    description: e.description,
    receipt_url: e.receiptUrl,
  };
}

async function getExpenses(req, res) {
  try {
    const expenses = await listExpenses();
    res.json(expenses.map(toExpenseResponse));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}

async function postExpense(req, res) {
  try {
    const { expense_type, amount, date, month, quarter, year } = req.body || {};
    if (!expense_type) {
      return res.status(400).json({ error: 'expense_type is required' });
    }
    if (amount == null || typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount (number) is required' });
    }
    if (!date || !month || !quarter || year == null) {
      return res.status(400).json({ error: 'date, month, quarter and year are required' });
    }
    const expense = await createExpense(req.body);
    res.status(201).json(toExpenseResponse(expense));
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message || 'Failed to create expense' });
  }
}

async function putExpense(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid expense id is required' });
    }
    const { expense_type, amount, date, month, quarter, year } = req.body || {};
    if (!expense_type) {
      return res.status(400).json({ error: 'expense_type is required' });
    }
    if (amount == null || typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount (number) is required' });
    }
    if (!date || !month || !quarter || year == null) {
      return res.status(400).json({ error: 'date, month, quarter and year are required' });
    }
    const expense = await updateExpense(id, req.body);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(toExpenseResponse(expense));
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: error.message || 'Failed to update expense' });
  }
}

async function deleteExpenseHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid expense id is required' });
    }
    const expense = await deleteExpense(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message || 'Failed to delete expense' });
  }
}

module.exports = {
  getExpenses,
  postExpense,
  putExpense,
  deleteExpenseHandler,
};

