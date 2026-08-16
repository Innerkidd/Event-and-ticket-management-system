const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const userModel = require('../models/user.model');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_ATTENDEE = 'ATTENDEE';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validateRegistration({ name, email, password }) {
  if (!name || !name.trim()) {
    throw new AuthError('Name is required', 400);
  }
  if (!email || !email.trim()) {
    throw new AuthError('Email is required', 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AuthError('Invalid email format', 400);
  }
  if (!password || password.length < 6) {
    throw new AuthError('Password must be at least 6 characters', 400);
  }
}

async function register({ name, email, password }) {
  validateRegistration({ name, email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userModel.findByEmail(normalizedEmail);
  if (existing) {
    throw new AuthError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLE_ATTENDEE,
  });

  return user;
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function buildAuthResult(user) {
  return {
    token: generateToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new AuthError('Invalid email or password', 401);
  }

  const user = await userModel.findByEmail(email.trim().toLowerCase());
  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password', 401);
  }

  return buildAuthResult(user);
}

async function googleLogin({ credential }) {
  if (!credential) {
    throw new AuthError('Google authentication failed', 401);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new AuthError('Google authentication failed', 401);
  }

  if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
    throw new AuthError('Google authentication failed', 401);
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split('@')[0];

  let user = await userModel.findByGoogleId(googleId);
  if (user) {
    return buildAuthResult(user);
  }

  user = await userModel.findByEmail(email);
  if (user) {
    user = await userModel.linkGoogleId(user.id, googleId);
    return buildAuthResult(user);
  }

  const unusablePasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  user = await userModel.create({
    name,
    email,
    passwordHash: unusablePasswordHash,
    role: ROLE_ATTENDEE,
    googleId,
  });

  return buildAuthResult(user);
}

module.exports = {
  register,
  login,
  googleLogin,
  AuthError,
};