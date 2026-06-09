const mongoose = require('mongoose');
const { listClients, createClient, updateClient, deleteClient } = require('./client.service');

function toClientResponse(c) {
  return {
    id: String(c._id),
    name: c.name,
    industry: c.industry,
    status: c.status,
    start_date: c.startDate,
    contact_name: c.contactName,
    contact_email: c.contactEmail,
    notes: c.notes,
  };
}

async function getClients(req, res) {
  try {
    const clients = await listClients();
    res.json(clients.map(toClientResponse));
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
}

async function postClient(req, res) {
  try {
    const { name, industry } = req.body || {};
    if (!name || !industry) {
      return res.status(400).json({ error: 'name and industry are required' });
    }
    const client = await createClient(req.body);
    res.status(201).json(toClientResponse(client));
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message || 'Failed to create client' });
  }
}

async function putClient(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid client id is required' });
    }
    const { name, industry } = req.body || {};
    if (!name || !industry) {
      return res.status(400).json({ error: 'name and industry are required' });
    }
    const client = await updateClient(id, req.body);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(toClientResponse(client));
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: error.message || 'Failed to update client' });
  }
}

async function deleteClientHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Valid client id is required' });
    }
    const client = await deleteClient(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: error.message || 'Failed to delete client' });
  }
}

module.exports = {
  getClients,
  postClient,
  putClient,
  deleteClientHandler,
};

