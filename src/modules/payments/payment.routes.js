const express = require('express');
const { getPayments, postPayment, putPayment, deletePaymentHandler } = require('./payment.controller');

const router = express.Router();

router.get('/', getPayments);
router.post('/', postPayment);
router.put('/:id', putPayment);
router.delete('/:id', deletePaymentHandler);

module.exports = router;

