const mongoose = require('mongoose');

const marketingSpendSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: [
        'Google Ads',
        'Facebook',
        'LinkedIn',
        'Instagram',
        'Twitter',
        'Email',
        'Content',
        'Events',
        'SEO',
        'Referral',
        'Other',
      ],
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    quarter: {
      type: String,
    },
    year: {
      type: Number,
    },
    amountSpent: {
      type: Number,
      required: true,
    },
    revenueAttributed: {
      type: Number,
    },
    leadsGenerated: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketingSpend', marketingSpendSchema);

