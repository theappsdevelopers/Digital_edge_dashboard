const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['Client', 'Project'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StatusLog', statusLogSchema);

