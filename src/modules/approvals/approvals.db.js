const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI_APPROVALS || process.env.MONGODB_URI;
const APPROVALS_DB_NAME = process.env.APPROVALS_DB_NAME || 'digital_edge_approvals';

let client;
let db;

async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI or MONGODB_URI_APPROVALS must be set for approvals DB');
  }

  if (db) return db;

  if (!client) {
    client = new MongoClient(uri);
  }

  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }

  db = client.db(APPROVALS_DB_NAME);
  return db;
}

async function getCollections() {
  const database = await getDb();
  return {
    users: database.collection('users'),
    requests: database.collection('requests'),
    requestApprovals: database.collection('request_approvals'),
  };
}

module.exports = {
  getDb,
  getCollections,
  ObjectId,
};

