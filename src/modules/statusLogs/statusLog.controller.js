const { listStatusLogs, createStatusLog } = require('./statusLog.service');

function toLogResponse(log) {
  return {
    id: String(log._id),
    entity_type: log.entityType,
    entity_id: String(log.entityId),
    comment: log.comment,
    date: log.date,
  };
}

async function getStatusLogs(req, res) {
  try {
    const { entity_type, entity_id } = req.query;
    const logs = await listStatusLogs({ entity_type, entity_id });
    res.json(logs.map(toLogResponse));
  } catch (error) {
    console.error('Error fetching status logs:', error);
    res.status(500).json({ error: 'Failed to fetch status logs' });
  }
}

async function postStatusLog(req, res) {
  try {
    const { entity_type, entity_id, comment, date } = req.body || {};
    if (!entity_type || !entity_id || comment == null || !date) {
      return res.status(400).json({
        error: 'entity_type, entity_id, comment and date are required',
      });
    }
    const log = await createStatusLog(req.body);
    res.status(201).json(toLogResponse(log));
  } catch (error) {
    console.error('Error creating status log:', error);
    res.status(500).json({ error: error.message || 'Failed to create status log' });
  }
}

module.exports = {
  getStatusLogs,
  postStatusLog,
};
