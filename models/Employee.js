const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: {
      type: String,
      enum: [
        'Engineering',
        'Design',
        'Sales',
        'Marketing',
        'Operations',
        'Finance',
        'HR',
        'Executive',
        'Other',
      ],
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
      required: true,
    },
    monthlyCost: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);

