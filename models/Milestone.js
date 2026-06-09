const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid'],
      default: 'Pending',
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Milestone', milestoneSchema);

