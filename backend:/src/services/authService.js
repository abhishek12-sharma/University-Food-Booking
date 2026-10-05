const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, ShopkeeperAssignment } = require('../models');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;

async function register({ name, email, password, phone, role = 'USER' }) {
  // Never allow registering as ADMIN through the public endpoint.
  // SHOPKEEPER registration is allowed but starts as ACTIVE (admin can suspend).
  if (role === 'ADMIN') throw AppError.forbidden('Cannot register as ADMIN');
  
  const existing = await User.findOne({ where: { email } });
  if (existing) throw AppError.conflict('An account with this email already exists');
  
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, phone: phone || null, password_hash, role, status: 'ACTIVE' });
  
  const token = signToken(user);
  return { user: safeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw AppError.unauthorized('Invalid email or password');
  
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw AppError.unauthorized('Invalid email or password');
  
  if (user.status !== 'ACTIVE') throw AppError.forbidden('Your account is not active. Contact support.');
  
  // Include shopkeeper food court assignment in login response
  let foodCourtId = null;
  if (user.role === 'SHOPKEEPER') {
    const assignment = await ShopkeeperAssignment.findOne({
      where: { shopkeeper_id: user.id, status: 'ACTIVE' },
    });
    foodCourtId = assignment ? assignment.food_court_id : null;
  }
  
  const token = signToken(user);
  return { user: { ...safeUser(user), foodCourtId }, token };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });
  if (!user) throw AppError.notFound('User not found');
  
  let foodCourtId = null;
  if (user.role === 'SHOPKEEPER') {
    const assignment = await ShopkeeperAssignment.findOne({
      where: { shopkeeper_id: user.id, status: 'ACTIVE' },
    });
    foodCourtId = assignment ? assignment.food_court_id : null;
  }
  
  return { ...user.toJSON(), foodCourtId };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findByPk(userId);
  if (!user) throw AppError.notFound('User not found');
  
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw AppError.unauthorized('Current password is incorrect');
  
  if (newPassword.length < 8) throw AppError.unprocessable('New password must be at least 8 characters');
  
  user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return { message: 'Password changed successfully' };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password_hash, ...safe } = user.toJSON ? user.toJSON() : user;
  return safe;
}

module.exports = { register, login, getProfile, changePassword };
