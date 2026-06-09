const express = require('express');
const { postForecast } = require('./forecast.controller');

const router = express.Router();

router.post('/', postForecast);

module.exports = router;

