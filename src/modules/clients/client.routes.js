const express = require('express');
const { getClients, postClient, putClient, deleteClientHandler } = require('./client.controller');

const router = express.Router();

router.get('/', getClients);
router.post('/', postClient);
router.put('/:id', putClient);
router.delete('/:id', deleteClientHandler);

module.exports = router;

