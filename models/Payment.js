const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
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
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Check', 'Credit Card', 'Cash', 'Other'],
    },
    referenceNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

