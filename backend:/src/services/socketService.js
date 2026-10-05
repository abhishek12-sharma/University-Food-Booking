/**
 * Socket.IO service — manages the shared io instance and emits
 * events defined in API_CONTRACT.md section 20.
 * Never broadcasts secrets or unexpired tokens in socket payloads.
 */

let _io = null;

function init(io) {
  _io = io;

  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token;
    // The socket is accepted without strict auth here — the backend
    // enforces auth on REST calls. Optionally verify token to join user rooms.
    try {
      if (token) {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.id;
        socket.role = payload.role;
        // Each user joins their own room to receive personal events
        socket.join(`user:${payload.id}`);
        // Shopkeepers join their assigned food court room
        if (payload.role === 'SHOPKEEPER') {
          const { ShopkeeperAssignment } = require('../models');
          ShopkeeperAssignment.findAll({ where: { shopkeeper_id: payload.id, status: 'ACTIVE' } })
            .then((assignments) => {
              assignments.forEach((a) => socket.join(`foodcourt:${a.food_court_id}`));
            })
            .catch(() => {});
        }
      }
    } catch {
      // Invalid token — still allow connection but without room membership
    }

    socket.on('disconnect', () => {});
  });
}

function getIo() {
  return _io;
}

// Emit to the user who owns the order
function emitToUser(userId, event, data) {
  if (!_io) return;
  _io.to(`user:${userId}`).emit(event, data);
}

// Emit to all shopkeepers of a food court
function emitToFoodCourt(foodCourtId, event, data) {
  if (!_io) return;
  _io.to(`foodcourt:${foodCourtId}`).emit(event, data);
}

// Convenience wrappers for order lifecycle events (API_CONTRACT.md §20)
function emitNewOrder(order) {
  emitToFoodCourt(order.food_court_id, 'NEW_ORDER', safeOrder(order));
}
function emitOrderConfirmed(order) {
  emitToUser(order.user_id, 'ORDER_CONFIRMED', safeOrder(order));
  emitToFoodCourt(order.food_court_id, 'ORDER_CONFIRMED', safeOrder(order));
}
function emitOrderPreparing(order) {
  emitToUser(order.user_id, 'ORDER_PREPARING', safeOrder(order));
}
function emitOrderReady(order) {
  emitToUser(order.user_id, 'ORDER_READY', safeOrder(order));
}
function emitOrderPickedUp(order) {
  emitToUser(order.user_id, 'ORDER_PICKED_UP', safeOrder(order));
  emitToFoodCourt(order.food_court_id, 'ORDER_PICKED_UP', safeOrder(order));
}
function emitOrderExpired(order) {
  emitToUser(order.user_id, 'ORDER_EXPIRED', safeOrder(order));
}
function emitOrderCancelled(order) {
  emitToUser(order.user_id, 'ORDER_CANCELLED', safeOrder(order));
}

function safeOrder(order) {
  // Only expose non-sensitive fields in socket payloads
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    food_court_id: order.food_court_id,
    user_id: order.user_id,
    pickup_deadline: order.pickup_deadline,
    updated_at: order.updated_at,
  };
}

module.exports = {
  init,
  getIo,
  emitToUser,
  emitToFoodCourt,
  emitNewOrder,
  emitOrderConfirmed,
  emitOrderPreparing,
  emitOrderReady,
  emitOrderPickedUp,
  emitOrderExpired,
  emitOrderCancelled,
};
