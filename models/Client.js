const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Retail',
        'Manufacturing',
        'Education',
        'Real Estate',
        'Consulting',
        'Media',
        'Other',
      ],
      required: true,
    },
    startDate: {
      type: Date,
    },
    status: {
      type: String,
      default: 'Active',
      required: true,
    },
    phone: {
      type: String,
    },
    contactName: {
      type: String,
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);

