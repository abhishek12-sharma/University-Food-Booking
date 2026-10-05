const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const orderService = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  // Authenticated user id comes from the verified JWT only — never from
  // req.body, per API_CONTRACT.md ("Never trust frontend user ID").
  const order = await orderService.createOrder(req.user.id, req.body);
  return success(res, { message: 'Order created', data: { order }, statusCode: 201 });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  return success(res, { message: 'Orders retrieved', data: { orders } });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.user.id, req.user.role);
  return success(res, { message: 'Order retrieved', data: { order } });
});

const getShopkeeperOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getShopkeeperOrders(req.user.id, req.query.status);
  return success(res, { message: 'Shopkeeper orders retrieved', data: { orders } });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatusByShopkeeper(
    req.user.id,
    req.params.orderId,
    req.body.status
  );
  return success(res, { message: 'Order status updated', data: { order } });
});

module.exports = { createOrder, getMyOrders, getOrder, getShopkeeperOrders, updateOrderStatus };
