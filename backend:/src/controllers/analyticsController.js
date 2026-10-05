const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const analyticsService = require('../services/analyticsService');

// Admin handlers
exports.adminOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminOverview();
  success(res, { message: 'Admin overview fetched', data });
});

exports.adminRevenue = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await analyticsService.getAdminRevenue({ from, to });
  success(res, { message: 'Admin revenue fetched', data });
});

exports.adminOrders = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await analyticsService.getAdminOrders({ from, to });
  success(res, { message: 'Admin orders fetched', data });
});

exports.adminFoodCourts = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminFoodCourts();
  success(res, { message: 'Admin food courts fetched', data });
});

exports.adminPopularFood = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const data = await analyticsService.getAdminPopularFood({ limit });
  success(res, { message: 'Admin popular food fetched', data });
});

exports.adminPeakHours = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminPeakHours();
  success(res, { message: 'Admin peak hours fetched', data });
});

// Shopkeeper handlers — use req.user.id
exports.shopkeeperOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getShopkeeperOverview(req.user.id);
  success(res, { message: 'Shopkeeper overview fetched', data });
});

exports.shopkeeperOrders = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await analyticsService.getShopkeeperOrders(req.user.id, { from, to });
  success(res, { message: 'Shopkeeper orders fetched', data });
});

exports.shopkeeperRevenue = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await analyticsService.getShopkeeperRevenue(req.user.id, { from, to });
  success(res, { message: 'Shopkeeper revenue fetched', data });
});

exports.shopkeeperPopularFood = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const data = await analyticsService.getShopkeeperPopularFood(req.user.id, { limit });
  success(res, { message: 'Shopkeeper popular food fetched', data });
});

exports.shopkeeperPickupDemand = asyncHandler(async (req, res) => {
  const data = await analyticsService.getShopkeeperPickupDemand(req.user.id);
  success(res, { message: 'Shopkeeper pickup demand fetched', data });
});

exports.shopkeeperWaste = asyncHandler(async (req, res) => {
  const data = await analyticsService.getShopkeeperWaste(req.user.id);
  success(res, { message: 'Shopkeeper waste fetched', data });
});
