const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { Op } = require('sequelize');
const { User, FoodCourt, ShopkeeperAssignment, Order, Payment, AuditLog, OrderItem } = require('../models');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');

// Dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalFoodCourts, recentOrders] = await Promise.all([
    User.count({ where: { role: 'USER' } }),
    Order.count(),
    FoodCourt.count({ where: { status: 'ACTIVE' } }),
    Order.findAll({ order: [['created_at', 'DESC']], limit: 10, include: [{ model: OrderItem, as: 'items' }] }),
  ]);
  const totalRevenue = await Payment.sum('amount', { where: { status: 'PAID' } }) || 0;
  success(res, { message: 'Dashboard data', data: { totalUsers, totalOrders, totalFoodCourts, totalRevenue, recentOrders } });
});

// Users
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await User.findAndCountAll({
    where, limit: Number(limit), offset, order: [['created_at', 'DESC']],
    attributes: { exclude: ['password_hash'] },
  });
  success(res, { message: 'Users fetched', data: { users: rows, total: count, page: Number(page), limit: Number(limit) } });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId, { attributes: { exclude: ['password_hash'] } });
  if (!user) throw AppError.notFound('User not found');
  success(res, { message: 'User fetched', data: { user } });
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  if (!user) throw AppError.notFound('User not found');
  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) throw AppError.unprocessable('Invalid status');
  user.status = status;
  await user.save();
  success(res, { message: 'User status updated', data: { user } });
});

// Shopkeepers
exports.getShopkeepers = asyncHandler(async (req, res) => {
  const shopkeepers = await User.findAll({
    where: { role: 'SHOPKEEPER' },
    attributes: { exclude: ['password_hash'] },
    include: [{ model: ShopkeeperAssignment, as: 'assignments', include: [{ model: FoodCourt, as: 'foodCourt' }] }],
    order: [['created_at', 'DESC']],
  });
  success(res, { message: 'Shopkeepers fetched', data: { shopkeepers } });
});

exports.getShopkeeperById = asyncHandler(async (req, res) => {
  const shopkeeper = await User.findOne({
    where: { id: req.params.id, role: 'SHOPKEEPER' },
    attributes: { exclude: ['password_hash'] },
    include: [{ model: ShopkeeperAssignment, as: 'assignments', include: [{ model: FoodCourt, as: 'foodCourt' }] }],
  });
  if (!shopkeeper) throw AppError.notFound('Shopkeeper not found');
  success(res, { message: 'Shopkeeper fetched', data: { shopkeeper } });
});

exports.approveShopkeeper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { foodCourtId } = req.body;
  const shopkeeper = await User.findOne({ where: { id, role: 'SHOPKEEPER' } });
  if (!shopkeeper) throw AppError.notFound('Shopkeeper not found');
  if (foodCourtId) {
    await ShopkeeperAssignment.findOrCreate({
      where: { shopkeeper_id: id, food_court_id: foodCourtId },
      defaults: { status: 'ACTIVE' },
    });
  }
  shopkeeper.status = 'ACTIVE';
  await shopkeeper.save();
  await AuditLog.create({ actor_user_id: req.user.id, action: 'APPROVE_SHOPKEEPER', resource_type: 'User', resource_id: id, metadata_json: { foodCourtId } });
  success(res, { message: 'Shopkeeper approved', data: { shopkeeper } });
});

exports.rejectShopkeeper = asyncHandler(async (req, res) => {
  const shopkeeper = await User.findOne({ where: { id: req.params.id, role: 'SHOPKEEPER' } });
  if (!shopkeeper) throw AppError.notFound('Shopkeeper not found');
  shopkeeper.status = 'SUSPENDED';
  await shopkeeper.save();
  await AuditLog.create({ actor_user_id: req.user.id, action: 'REJECT_SHOPKEEPER', resource_type: 'User', resource_id: req.params.id });
  success(res, { message: 'Shopkeeper rejected', data: { shopkeeper } });
});

exports.updateShopkeeperStatus = asyncHandler(async (req, res) => {
  const shopkeeper = await User.findOne({ where: { id: req.params.id, role: 'SHOPKEEPER' } });
  if (!shopkeeper) throw AppError.notFound('Shopkeeper not found');
  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) throw AppError.unprocessable('Invalid status');
  shopkeeper.status = status;
  await shopkeeper.save();
  success(res, { message: 'Status updated', data: { shopkeeper } });
});

// Food Courts
exports.getFoodCourts = asyncHandler(async (req, res) => {
  const foodCourts = await FoodCourt.findAll({ order: [['name', 'ASC']] });
  success(res, { message: 'Food courts fetched', data: { foodCourts } });
});

exports.createFoodCourt = asyncHandler(async (req, res) => {
  const { name, description, location, opening_time, closing_time } = req.body;
  if (!name) throw AppError.unprocessable('Name is required');
  const fc = await FoodCourt.create({ name, description, location, opening_time: opening_time || '09:30:00', closing_time: closing_time || '21:00:00', status: 'ACTIVE' });
  await AuditLog.create({ actor_user_id: req.user.id, action: 'CREATE_FOOD_COURT', resource_type: 'FoodCourt', resource_id: fc.id });
  success(res, { message: 'Food court created', data: { foodCourt: fc } }, 201);
});

exports.getFoodCourtById = asyncHandler(async (req, res) => {
  const fc = await FoodCourt.findByPk(req.params.id);
  if (!fc) throw AppError.notFound('Food court not found');
  success(res, { message: 'Food court fetched', data: { foodCourt: fc } });
});

exports.updateFoodCourt = asyncHandler(async (req, res) => {
  const fc = await FoodCourt.findByPk(req.params.id);
  if (!fc) throw AppError.notFound('Food court not found');
  const { name, description, location, opening_time, closing_time } = req.body;
  if (name) fc.name = name;
  if (description !== undefined) fc.description = description;
  if (location !== undefined) fc.location = location;
  if (opening_time) fc.opening_time = opening_time;
  if (closing_time) fc.closing_time = closing_time;
  await fc.save();
  success(res, { message: 'Food court updated', data: { foodCourt: fc } });
});

exports.updateFoodCourtStatus = asyncHandler(async (req, res) => {
  const fc = await FoodCourt.findByPk(req.params.id);
  if (!fc) throw AppError.notFound('Food court not found');
  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE'].includes(status)) throw AppError.unprocessable('Invalid status');
  fc.status = status;
  await fc.save();
  success(res, { message: 'Status updated', data: { foodCourt: fc } });
});

// Orders
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await Order.findAndCountAll({
    where, limit: Number(limit), offset, order: [['created_at', 'DESC']],
    include: [
      { model: OrderItem, as: 'items' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: FoodCourt, as: 'foodCourt', attributes: ['id', 'name'] },
    ],
  });
  success(res, { message: 'Orders fetched', data: { orders: rows, total: count } });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: FoodCourt, as: 'foodCourt', attributes: ['id', 'name'] },
    ],
  });
  if (!order) throw AppError.notFound('Order not found');
  success(res, { message: 'Order fetched', data: { order } });
});

// Audit logs
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await AuditLog.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit: Number(limit),
    offset,
    include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }],
  });
  success(res, { message: 'Audit logs fetched', data: { logs: rows, total: count } });
});

// Payments
exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await Payment.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit: Number(limit),
    offset,
    include: [{ model: Order, as: 'order', attributes: ['id', 'order_number', 'user_id', 'total_amount'] }],
  });
  success(res, { message: 'Payments fetched', data: { payments: rows, total: count } });
});
