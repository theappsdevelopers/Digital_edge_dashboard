const express = require('express');
const { login, resetAdmin, signup, createAdmin } = require('./auth.controller');
const { requireAuth, requireAdmin } = require('./auth.middleware');

const router = express.Router();

// Public auth endpoints
router.post('/login', login);
router.post('/signup', signup);

// Admin-only endpoints
router.post('/reset-admin', resetAdmin);
router.post('/create-admin', requireAuth, requireAdmin, createAdmin);

module.exports = router;
