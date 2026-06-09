const mongoose = require('mongoose');

const forecastExpenseSchema = new mongoose.Schema(
  {
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
    projectedAmount: {
      type: Number,
      required: true,
    },
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
    confidenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    scenario: {
      type: String,
      default: 'baseline',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForecastExpense', forecastExpenseSchema);

