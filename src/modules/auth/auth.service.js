const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getModel } = require('../../config/requestContext');

const JWT_SECRET = process.env.JWT_SECRET || 'digitaledge-secret-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const DEFAULT_EXPIRY = '7d';
// Hard caps – can be overridden via env if needed
const MAX_NON_ADMIN_USERS = parseInt(process.env.MAX_NON_ADMIN_USERS || '5', 10);
const MAX_ADMINS = parseInt(process.env.MAX_ADMINS || '5', 10);

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

/**
 * Validate admin credentials.
 *
 * Rules:
 * - If ANY admin user exists in DB, only DB admins are allowed (env ADMIN_* is ignored).
 * - If NO admin user exists yet, allow a one-time bootstrap login with ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * Used for admin login + (legacy) admin-only flows.
 * @returns { Promise<{ email: string, role: 'admin' }> }
 * @throws if invalid
 */
async function validateAdmin(email, password) {
  const User = getModel('User');
  const normalizedInput = normalizeEmail(email);

  // If we already have at least one admin user in DB, env admin is disabled.
  const anyAdmin = await User.findOne({ role: 'admin' }).lean();
  if (anyAdmin) {
    const dbAdmin = await User.findOne({ role: 'admin', email: normalizedInput }).lean();
    if (!dbAdmin) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    const match = await bcrypt.compare(password || '', dbAdmin.passwordHash || '');
    if (!match) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    return { email: normalizedInput, role: 'admin' };
  }

  // Bootstrap path – no admin user yet, fall back to env admin
  const expectedEmail = normalizeEmail(ADMIN_EMAIL);
  if (normalizedInput !== expectedEmail || (password || '') !== ADMIN_PASSWORD) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  return { email: expectedEmail, role: 'admin' };
}

/**
 * Generic self-service credential reset for any existing DB user (admin or non-admin).
 * Verifies current email + password against User collection, then updates that user.
 */
async function resetCredentials(currentEmail, currentPassword, newEmail, newPassword) {
  const User = getModel('User');
  const normalizedCurrentEmail = normalizeEmail(currentEmail);
  if (!normalizedCurrentEmail) {
    const err = new Error('Current email is required');
    err.statusCode = 400;
    throw err;
  }
  if (!currentPassword) {
    const err = new Error('Current password is required');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: normalizedCurrentEmail });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword || '', user.passwordHash || '');
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const normalizedNewEmail = normalizeEmail(newEmail);
  if (!normalizedNewEmail) {
    const err = new Error('New email is required');
    err.statusCode = 400;
    throw err;
  }
  if (!newPassword || String(newPassword).length < 1) {
    const err = new Error('New password is required');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  user.email = normalizedNewEmail;
  user.passwordHash = passwordHash;
  await user.save();

  return { email: normalizedNewEmail, role: user.role || 'client' };
}

/**
 * Reset admin credentials: verify current, then set new (stored in DB).
 * @param { string } currentEmail
 * @param { string } currentPassword
 * @param { string } newEmail
 * @param { string } newPassword
 */
async function resetAdminCredentials(currentEmail, currentPassword, newEmail, newPassword) {
  const User = getModel('User');
  await validateAdmin(currentEmail, currentPassword);
  const normalizedNewEmail = normalizeEmail(newEmail);
  if (!normalizedNewEmail) throw new Error('New email is required');
  if (!newPassword || String(newPassword).length < 1) throw new Error('New password is required');
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  let admin = await User.findOne({ role: 'admin' });
  if (admin) {
    admin.email = normalizedNewEmail;
    admin.passwordHash = passwordHash;
    await admin.save();
  } else {
    await User.create({
      email: normalizedNewEmail,
      passwordHash,
      role: 'admin',
    });
  }
  return { email: normalizedNewEmail, role: 'admin' };
}

/**
 * Public signup for non-admin users (manager/staff/client).
 * Enforces a hard cap on total non-admin users.
 */
async function signupUser({ email, password, role = 'manager' }) {
  const User = getModel('User');
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error('Email is required');
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 1) {
    const err = new Error('Password is required');
    err.statusCode = 400;
    throw err;
  }
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('User with this email already exists');
    err.statusCode = 400;
    throw err;
  }

  if (role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= MAX_ADMINS) {
      const err = new Error(`Maximum admins (${MAX_ADMINS}) reached`);
      err.statusCode = 400;
      throw err;
    }
  } else {
    const nonAdminCount = await User.countDocuments({ role: { $ne: 'admin' } });
    if (nonAdminCount >= MAX_NON_ADMIN_USERS) {
      const err = new Error(`Maximum non-admin users (${MAX_NON_ADMIN_USERS}) reached`);
      err.statusCode = 400;
      throw err;
    }
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return { id: String(user._id), email: user.email, role: user.role };
}

/**
 * Admin-only endpoint: create additional admin users (up to MAX_ADMINS).
 */
async function createAdminUser({ email, password }) {
  const User = getModel('User');
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error('Email is required');
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 1) {
    const err = new Error('Password is required');
    err.statusCode = 400;
    throw err;
  }

  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount >= MAX_ADMINS) {
    const err = new Error(`Maximum admins (${MAX_ADMINS}) reached`);
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('User with this email already exists');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: 'admin',
  });

  return { id: String(user._id), email: user.email, role: user.role };
}

/**
 * Generic user validation for login (admin + non-admin).
 * - If a User with this email exists in DB → validate password and return its role.
 * - If no such User exists → fall back to validateAdmin (env bootstrap).
 */
async function validateUser(email, password) {
  const User = getModel('User');
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error('Email is required');
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 1) {
    const err = new Error('Password is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    const match = await bcrypt.compare(password || '', existing.passwordHash || '');
    if (!match) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    return { email: normalizedEmail, role: existing.role || 'client' };
  }

  // No DB user → maybe this is the initial env-based admin
  return validateAdmin(email, password);
}

/**
 * Sign a JWT for a user (admin or non-admin).
 * @param { { email: string, role?: string } } payload
 * @returns { string } token
 */
function signToken(payload) {
  return jwt.sign(
    { sub: payload.role || 'admin', email: payload.email, role: payload.role || 'admin' },
    JWT_SECRET,
    { expiresIn: DEFAULT_EXPIRY }
  );
}

/**
 * Verify JWT and return decoded payload.
 * @param { string } token
 * @returns { { sub: string, email: string, role?: string } }
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  validateAdmin,
  validateUser,
  resetCredentials,
  resetAdminCredentials,
  signupUser,
  createAdminUser,
  signToken,
  verifyToken,
};
