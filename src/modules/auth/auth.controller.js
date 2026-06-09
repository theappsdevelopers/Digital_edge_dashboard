const {
  validateUser,
  signToken,
  resetCredentials,
  signupUser,
  createAdminUser,
} = require('./auth.service');

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const user = await validateUser(email, password);
    const token = signToken(user);
    res.json({
      token,
      user: { email: user.email, role: user.role || 'client' },
    });
  } catch (err) {
    const status = err.statusCode || 401;
    res.status(status).json({ error: err.message || 'Invalid email or password' });
  }
}

async function resetAdmin(req, res) {
  try {
    const { currentEmail, currentPassword, newEmail, newPassword } = req.body || {};
    if (!currentEmail || !currentPassword) {
      return res.status(400).json({ error: 'Current email and current password are required' });
    }
    if (!newEmail || !newPassword) {
      return res.status(400).json({ error: 'New email and new password are required' });
    }
    const user = await resetCredentials(currentEmail, currentPassword, newEmail, newPassword);
    res.json({
      success: true,
      message: 'Credentials updated. Use the new credentials to log in.',
      email: user.email,
    });
  } catch (err) {
    const status = err.statusCode || 401;
    res.status(status).json({ error: err.message || 'Failed to reset credentials' });
  }
}

/**
 * Public signup for non-admin users (manager/staff/client).
 */
async function signup(req, res) {
  try {
    const { email, password, role } = req.body || {};
    const user = await signupUser({ email, password, role });
    const token = signToken({ email: user.email, role: user.role });
    res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    const status = err.statusCode || 400;
    console.error(`[signup] ${status} – ${err.message}`);
    res.status(status).json({ error: err.message || 'Failed to sign up user' });
  }
}

/**
 * Admin-only endpoint to create additional admins (up to MAX_ADMINS).
 */
async function createAdmin(req, res) {
  try {
    const { email, password } = req.body || {};
    const user = await createAdminUser({ email, password });
    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message || 'Failed to create admin user' });
  }
}

module.exports = {
  login,
  resetAdmin,
  signup,
  createAdmin,
};
