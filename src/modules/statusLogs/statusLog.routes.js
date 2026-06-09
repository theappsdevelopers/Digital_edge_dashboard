const express = require('express');
const { getStatusLogs, postStatusLog } = require('./statusLog.controller');

const router = express.Router();

router.get('/', getStatusLogs);
router.post('/', postStatusLog);

module.exports = router;
