const mongoose = require('mongoose');

const headcountSnapshotSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
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
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    monthlyCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeadcountSnapshot', headcountSnapshotSchema);

