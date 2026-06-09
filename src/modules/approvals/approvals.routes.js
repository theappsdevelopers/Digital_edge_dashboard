const express = require('express');
const {
  signup,
  login,
  reset,
  listUsers,
  listApprovers,
  getRequests,
  createRequest,
  cancelRequest,
  approveRequest,
} = require('./approvals.service');

function createApprovalsRouter(io) {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    try {
      const result = await signup(req.body || {});
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in /signup:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const result = await login(req.body || {});
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in /login:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/reset', async (_req, res) => {
    try {
      const result = await reset();
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in /reset:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/users', async (_req, res) => {
    try {
      const users = await listUsers();
      res.status(200).json(users);
    } catch (err) {
      console.error('Error in /users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/approvers', async (_req, res) => {
    try {
      const approvers = await listApprovers();
      res.status(200).json(approvers);
    } catch (err) {
      console.error('Error in /approvers:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/requests', async (req, res) => {
    try {
      const { role, userId } = req.query;
      const result = await getRequests({ role, userId });
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in GET /requests:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/requests', async (req, res) => {
    try {
      const result = await createRequest(req.body || {}, io);
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in POST /requests:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/requests/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body || {};
      const result = await cancelRequest({ id, userId }, io);
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in PATCH /requests/:id/cancel:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/requests/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { approverId, status } = req.body || {};
      const result = await approveRequest({ id, approverId, status }, io);
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Error in PATCH /requests/:id/approve:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createApprovalsRouter;

