const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_ATTENDEE = 'ATTENDEE';

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

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  register,
  login,
  AuthError,
};