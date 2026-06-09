const { getModel } = require('../../config/requestContext');

async function listPayments() {
  const Payment = getModel('Payment');
  return Payment.find({}).lean();
}

/**
 * Create payment. Body: client_id, project_id, milestone_id (optional, empty string = null), amount, payment_date, month, quarter, year, payment_method, reference_number, notes.
 */
async function createPayment(body) {
  const Payment = getModel('Payment');
  const doc = {
    client: body.client_id,
    project: body.project_id,
    amount: body.amount,
    paymentDate: body.payment_date,
    month: body.month,
    quarter: body.quarter,
    year: body.year,
    paymentMethod: body.payment_method,
    referenceNumber: body.reference_number || undefined,
    notes: body.notes,
  };
  const milestoneId = body.milestone_id;
  if (milestoneId && String(milestoneId).trim() !== '') {
    doc.milestone = milestoneId;
  }
  const payment = await Payment.create(doc);
  return payment.toObject();
}

function buildPaymentUpdate(body) {
  const update = {
    client: body.client_id,
    project: body.project_id,
    amount: body.amount,
    paymentDate: body.payment_date,
    month: body.month,
    quarter: body.quarter,
    year: body.year,
    paymentMethod: body.payment_method,
    referenceNumber: body.reference_number || undefined,
    notes: body.notes,
  };
  const milestoneId = body.milestone_id;
  update.milestone = milestoneId && String(milestoneId).trim() !== '' ? milestoneId : null;
  return update;
}

async function updatePayment(id, body) {
  const Payment = getModel('Payment');
  const update = buildPaymentUpdate(body);
  const payment = await Payment.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  return payment;
}

async function deletePayment(id) {
  const Payment = getModel('Payment');
  const payment = await Payment.findByIdAndDelete(id);
  return payment;
}

module.exports = {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
};

