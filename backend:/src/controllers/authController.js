const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const authService = require('../services/authService');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    const AppError = require('../utils/AppError');
    throw AppError.unprocessable('name, email, and password are required');
  }
  const result = await authService.register({ name, email, password, phone, role });
  success(res, { message: 'Registration successful', data: result }, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const AppError = require('../utils/AppError');
    throw AppError.unprocessable('email and password are required');
  }
  const result = await authService.login({ email, password });
  success(res, { message: 'Login successful', data: result });
});

exports.logout = asyncHandler(async (req, res) => {
  // JWT is stateless — logout is handled client-side by discarding the token.
  // If a token blacklist is needed, implement it here.
  success(res, { message: 'Logged out successfully', data: null });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  success(res, { message: 'Profile fetched', data: user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  success(res, { message: result.message, data: null });
});
