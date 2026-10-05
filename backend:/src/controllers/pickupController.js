const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { Order, PickupToken, Payment } = require('../models');
const AppError = require('../utils/AppError');
const { assertShopkeeperOwnsFoodCourt } = require('../utils/authz');
const socketService = require('../services/socketService');

/**
 * GET /api/orders/:orderId/pickup-qr
 * Returns a secure QR token for a paid, ready (or confirmed/preparing) order.
 * Only the order owner may request it.
 */
exports.getPickupQR = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await Order.findByPk(orderId, {
    include: [{ model: Payment, as: 'payments' }],
  });
  if (!order) throw AppError.notFound('Order not found');
  if (order.user_id !== req.user.id) throw AppError.forbidden('You may only view your own orders');
  if (!['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) {
    throw AppError.unprocessable(`Cannot generate QR for order with status ${order.status}`);
  }

  const paid = order.payments?.some((p) => p.status === 'PAID');
  if (!paid) throw AppError.unprocessable('Order is not paid. Complete payment before pickup.');

  // Upsert pickup token — reuse existing if not yet used
  let pickupToken = await PickupToken.findOne({ where: { order_id: orderId } });
  if (!pickupToken || pickupToken.used_at) {
    // Generate a new token
    const rawToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = order.pickup_deadline;

    if (pickupToken && pickupToken.used_at) {
      // Already used — cannot regenerate
      throw AppError.unprocessable('This order has already been picked up');
    }

    pickupToken = await PickupToken.create({
      order_id: orderId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    // Return raw token (only time it is revealed)
    return success(res, {
      message: 'QR token generated',
      data: { token: rawToken, orderId, expiresAt, orderNumber: order.order_number },
    });
  }

  // Token already exists and unused — regenerate display token from stored hash not possible,
  // so issue a new token by deleting old and recreating
  const rawToken = uuidv4();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  pickupToken.token_hash = tokenHash;
  pickupToken.expires_at = order.pickup_deadline;
  await pickupToken.save();

  success(res, {
    message: 'QR token generated',
    data: { token: rawToken, orderId, expiresAt: order.pickup_deadline, orderNumber: order.order_number },
  });
});

/**
 * POST /api/pickup/verify
 * Shopkeeper scans QR — verifies token and marks order PICKED_UP.
 */
exports.verifyPickup = asyncHandler(async (req, res) => {
  const { token, foodCourtId } = req.body;
  if (!token) throw AppError.unprocessable('token is required');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const pickupToken = await PickupToken.findOne({ where: { token_hash: tokenHash } });

  if (!pickupToken) throw AppError.unprocessable('Invalid QR token');
  if (pickupToken.used_at) throw AppError.conflict('This QR has already been used');
  if (new Date() > new Date(pickupToken.expires_at)) {
    throw AppError.unprocessable('QR token has expired');
  }

  const order = await Order.findByPk(pickupToken.order_id, {
    include: [{ model: Payment, as: 'payments' }],
  });
  if (!order) throw AppError.notFound('Order not found');

  // Shopkeeper must own the food court
  await assertShopkeeperOwnsFoodCourt(req.user.id, order.food_court_id);

  // Optionally validate foodCourtId from request
  if (foodCourtId && Number(foodCourtId) !== order.food_court_id) {
    throw AppError.forbidden('This order does not belong to your food court');
  }

  if (order.status === 'EXPIRED') throw AppError.unprocessable('Order has expired and cannot be picked up');
  if (order.status === 'PICKED_UP') throw AppError.conflict('Order has already been picked up');
  if (order.status === 'CANCELLED') throw AppError.unprocessable('Order has been cancelled');

  if (order.status !== 'READY') throw AppError.unprocessable('Order is not yet READY for pickup');

  const paid = order.payments?.some((p) => p.status === 'PAID');
  if (!paid) throw AppError.unprocessable('Order payment is not confirmed');

  // Check pickup deadline
  if (new Date() > new Date(order.pickup_deadline)) {
    order.status = 'EXPIRED';
    await order.save();
    socketService.emitOrderExpired(order);
    throw AppError.unprocessable('Order has expired — pickup deadline has passed');
  }

  // Mark as picked up
  pickupToken.used_at = new Date();
  await pickupToken.save();

  order.status = 'PICKED_UP';
  await order.save();

  socketService.emitOrderPickedUp(order);

  success(res, {
    message: 'Order picked up successfully',
    data: { orderId: order.id, orderNumber: order.order_number, status: 'PICKED_UP' },
  });
});
