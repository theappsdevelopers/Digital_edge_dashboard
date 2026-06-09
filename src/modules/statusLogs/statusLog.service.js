const mongoose = require('mongoose');
const { getModel } = require('../../config/requestContext');

/**
 * Filter logs by entity_type and entity_id (query params).
 * @param {object} filter - { entity_type, entity_id }
 */
async function listStatusLogs(filter = {}) {
  const StatusLog = getModel('StatusLog');
  const query = {};
  if (filter.entity_type) {
    query.entityType = filter.entity_type;
  }
  if (filter.entity_id) {
    query.entityId = mongoose.isValidObjectId(filter.entity_id)
      ? new mongoose.Types.ObjectId(filter.entity_id)
      : filter.entity_id;
  }
  return StatusLog.find(query).sort({ date: -1 }).lean();
}

async function createStatusLog(body) {
  const StatusLog = getModel('StatusLog');
  const doc = {
    entityType: body.entity_type,
    entityId: body.entity_id,
    comment: body.comment,
    date: body.date,
  };
  const log = await StatusLog.create(doc);
  return log.toObject();
}

module.exports = {
  listStatusLogs,
  createStatusLog,
};
