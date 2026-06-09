const mongoose = require('mongoose');
const { listPayments, createPayment, updatePayment, deletePayment } = require('./payment.service');

function toPaymentResponse(p) {
  return {
    id: String(p._id),
    client_id: p.client ? String(p.client) : null,
    project_id: p.project ? String(p.project) : null,
    milestone_id: p.milestone ? String(p.milestone) : null,
    amount: p.amount,
    payment_date: p.paymentDate,
    month: p.month,
    quarter: p.quarter,
    year: p.year,
    payment_method: p.paymentMethod,
    reference_number: p.referenceNumber,
    notes: p.notes,
  };
}

async function getPayments(req, res) {
  try {
    const payments = await listPayments();
    res.json(payments.map(toPaymentResponse));
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

async function postPayment(req, res) {
  try {
    const { client_id, project_id, amount, payment_date, month, quarter, year } = req.body || {};
    if (!client_id || !project_id) {
      return res.status(400).json({ error: 'client_id and project_id are required' });
    }
    if (amount == null || typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount (number) is required' });
    }
    if (!payment_date || !month || !quarter || year == null) {
      return res.status(400).json({ error: 'payment_date, month, quarter and year are required' });
    }
    const payment = await createPayment(req.body);
    res.status(201).json(toPaymentResponse(payment));
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
}

async function putPayment(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid payment id is required' });
    }
    const { client_id, project_id, amount, payment_date, month, quarter, year } = req.body || {};
    if (!client_id || !project_id) {
      return res.status(400).json({ error: 'client_id and project_id are required' });
    }
    if (amount == null || typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount (number) is required' });
    }
    if (!payment_date || !month || !quarter || year == null) {
      return res.status(400).json({ error: 'payment_date, month, quarter and year are required' });
    }
    const payment = await updatePayment(id, req.body);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(toPaymentResponse(payment));
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment' });
  }
}

async function deletePaymentHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid payment id is required' });
    }
    const payment = await deletePayment(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment' });
  }
}

module.exports = {
  getPayments,
  postPayment,
  putPayment,
  deletePaymentHandler,
};

