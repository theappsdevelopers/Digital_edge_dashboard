const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'Not Started',
        'In Progress',
        'On Hold',
        'Completed',
        'Cancelled',
      ],
      default: 'Not Started',
      required: true,
    },
    description: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

