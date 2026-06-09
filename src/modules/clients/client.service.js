const { getModel } = require('../../config/requestContext');

async function listClients() {
  const Client = getModel('Client');
  return Client.find({}).lean();
}

/**
 * Accepts payload (snake_case or camelCase from FE), maps to model, saves.
 * @param {object} body - name, industry, status, start_date/startDate, contact_name/contactName, contact_email/contactEmail, notes, phone, assignedUserId/assignedUser, archived
 */
async function createClient(body) {
  const Client = getModel('Client');
  const doc = {
    name: body.name,
    industry: body.industry,
    status: body.status ?? 'Active',
    startDate: body.start_date || body.startDate,
    contactName: body.contact_name ?? body.contactName,
    contactEmail: body.contact_email ?? body.contactEmail,
    notes: body.notes,
    phone: body.phone,
    archived: body.archived ?? false,
  };
  if (body.assignedUserId || body.assignedUser) {
    doc.assignedUser = body.assignedUserId || body.assignedUser;
  }
  const client = await Client.create(doc);
  return client.toObject();
}

/**
 * Update client by id. Same body shape as create (snake_case or camelCase).
 */
async function updateClient(id, body) {
  const Client = getModel('Client');
  const update = {
    name: body.name,
    industry: body.industry,
    status: body.status ?? 'Active',
    startDate: body.start_date || body.startDate,
    contactName: body.contact_name ?? body.contactName,
    contactEmail: body.contact_email ?? body.contactEmail,
    notes: body.notes,
    phone: body.phone,
    archived: body.archived ?? false,
  };
  if (body.assignedUserId !== undefined || body.assignedUser !== undefined) {
    update.assignedUser = body.assignedUserId || body.assignedUser || null;
  }
  const client = await Client.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  return client;
}

async function deleteClient(id) {
  const Client = getModel('Client');
  const client = await Client.findByIdAndDelete(id);
  return client;
}

module.exports = {
  listClients,
  createClient,
  updateClient,
  deleteClient,
};

