const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseType: {
      type: String,
      enum: [
        'Salary',
        'Office',
        'Marketing',
        'Operations',
        'Software',
        'Travel',
        'Professional Services',
        'Utilities',
        'Other',
      ],
      required: true,
    },
    category: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    quarter: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    vendor: {
      type: String,
    },
    description: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);

