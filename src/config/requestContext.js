const { AsyncLocalStorage } = require('async_hooks');
const { getConnection } = require('./database');

const storage = new AsyncLocalStorage();

/**
 * Run the rest of the request in a context where getModel() uses the given connection.
 * Middleware calls this with the connection chosen from the NODE_ENV header.
 */
function runWithConnection(conn, next) {
  return storage.run(conn, next);
}

/**
 * Get the Mongoose model for the current request's DB (dev or prod).
 * Must be called from within a request that went through the dbContext middleware.
 * @param {string} modelName - e.g. 'User', 'Client', 'Project'
 */
function getModel(modelName) {
  const conn = storage.getStore();
  if (!conn) {
    throw new Error('getModel() called outside request context. Ensure dbContext middleware runs first.');
  }
  return conn.model(modelName);
}

module.exports = {
  runWithConnection,
  getModel,
  getConnection,
};
