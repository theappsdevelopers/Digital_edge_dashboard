const mongoose = require('mongoose');

// Allow single MONGODB_URI: derive dev/prod by swapping DB name in path
function getUriForEnv(envKey, defaultUri, dbName) {
  const explicit = process.env[envKey];
  if (explicit) return explicit;
  if (!defaultUri) return null;
  try {
    const url = new URL(defaultUri);
    url.pathname = '/' + dbName;
    return url.toString();
  } catch {
    return defaultUri.replace(/\/([^/?]+)(\?|$)/, '/' + dbName + '$2');
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI_DEV = getUriForEnv('MONGODB_URI_DEV', MONGODB_URI, 'digital_edge_dev');
const MONGODB_URI_PROD = getUriForEnv('MONGODB_URI_PROD', MONGODB_URI, 'digital_edge_prod');

let connDev;
let connProd;

/**
 * Return the connection for the given env.
 * Use this with the request's NODE_ENV header: dev → digital_edge_dev, production → digital_edge_prod.
 */
function getConnection(env) {
  const isProd = String(env || '').toLowerCase() === 'production';
  return isProd ? connProd : connDev;
}

/**
 * Connect to both DBs and register all models on both connections.
 * Backend uses request header NODE_ENV to pick connection (same URL for preview and live).
 */
const connectDB = async () => {
  if (!MONGODB_URI_DEV) {
    console.error('MongoDB: MONGODB_URI_DEV or MONGODB_URI not set (for development/preview)');
    return;
  }
  if (!MONGODB_URI_PROD) {
    console.error('MongoDB: MONGODB_URI_PROD or MONGODB_URI not set (for production)');
    return;
  }

  try {
    connDev = mongoose.createConnection(MONGODB_URI_DEV);
    connProd = mongoose.createConnection(MONGODB_URI_PROD);

    // Load all models (they register on default mongoose; we copy to connDev/connProd)
    require('../../models/User');
    require('../../models/Client');
    require('../../models/Project');
    require('../../models/Payment');
    require('../../models/Expense');
    require('../../models/Employee');
    require('../../models/Milestone');
    require('../../models/StatusLog');
    require('../../models/HeadcountSnapshot');
    require('../../models/ForecastRevenue');
    require('../../models/ForecastExpense');
    require('../../models/MarketingSpend');
    require('../../models/Invoice');

    for (const name of mongoose.modelNames()) {
      const schema = mongoose.models[name].schema;
      connDev.model(name, schema);
      connProd.model(name, schema);
    }

    await Promise.all([connDev.asPromise(), connProd.asPromise()]);
    const devDb = connDev.db?.databaseName || 'digital_edge_dev';
    const prodDb = connProd.db?.databaseName || 'digital_edge_prod';
    console.log(`MongoDB: ${devDb} and ${prodDb} connected (use X-Environment header: preview → dev, production → prod)`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;
module.exports.getConnection = getConnection;
