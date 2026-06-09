const mongoose = require('mongoose');

const forecastRevenueSchema = new mongoose.Schema(
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
    sourceType: {
      type: String,
      enum: ['milestone_based', 'trend_based', 'hybrid'],
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

module.exports = mongoose.model('ForecastRevenue', forecastRevenueSchema);

