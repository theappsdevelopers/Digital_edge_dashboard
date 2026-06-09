const { getModel } = require('../../config/requestContext');

async function listExpenses() {
  const Expense = getModel('Expense');
  return Expense.find({}).lean();
}

/**
 * Create expense. Body: expense_type, category, amount, date, month, quarter, year, vendor, description, receipt_url (snake_case).
 */
async function createExpense(body) {
  const Expense = getModel('Expense');
  const doc = {
    expenseType: body.expense_type,
    category: body.category,
    amount: body.amount,
    date: body.date,
    month: body.month,
    quarter: body.quarter,
    year: body.year,
    vendor: body.vendor,
    description: body.description,
    receiptUrl: body.receipt_url,
  };
  const expense = await Expense.create(doc);
  return expense.toObject();
}

/**
 * Update expense by id. Same body shape as create.
 */
async function updateExpense(id, body) {
  const Expense = getModel('Expense');
  const update = {
    expenseType: body.expense_type,
    category: body.category,
    amount: body.amount,
    date: body.date,
    month: body.month,
    quarter: body.quarter,
    year: body.year,
    vendor: body.vendor,
    description: body.description,
    receiptUrl: body.receipt_url,
  };
  const expense = await Expense.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  return expense;
}

async function deleteExpense(id) {
  const Expense = getModel('Expense');
  const expense = await Expense.findByIdAndDelete(id);
  return expense;
}

module.exports = {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

