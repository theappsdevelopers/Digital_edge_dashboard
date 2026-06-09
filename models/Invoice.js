const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);

