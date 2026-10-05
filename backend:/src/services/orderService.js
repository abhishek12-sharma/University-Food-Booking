const { sequelize, Order, OrderItem, FoodItem, FoodCourt, PickupSlot } = require('../models');
const AppError = require('../utils/AppError');
const { generateOrderNumber } = require('../utils/orderNumber');
const { reserveFoodItemQuantity } = require('./inventoryService');
const { reserveSlotCapacity, releaseSlotCapacity } = require('./pickupSlotService');
const { assertShopkeeperOwnsFoodCourt, getAssignedFoodCourtIds } = require('../utils/authz');

const PICKUP_WINDOW_MINUTES = parseInt(process.env.PICKUP_WINDOW_MINUTES, 10) || 15;

/**
 * Creates an order. Implements the full validation + reservation sequence
 * from the MEMBER 3 brief section 5 (steps 1-12), all inside one DB
 * transaction so a failure anywhere rolls back inventory + slot capacity
 * together. Never trusts frontend price, total, availability, or user ID.
 */
async function createOrder(authenticatedUserId, payload) {
  const { foodCourtId, pickupSlotId, items } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw AppError.unprocessable('Order must contain at least one item');
  }

  // Collapse duplicate food item entries so "duplicate operations" (brief
  // section 11) can't be used to bypass per-line quantity validation.
  const quantityByFoodItemId = new Map();
  for (const line of items) {
    const foodItemId = Number(line.foodItemId);
    const quantity = Number(line.quantity);
    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      throw AppError.unprocessable('Invalid food item id in order items');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw AppError.unprocessable('Invalid quantity in order items');
    }
    quantityByFoodItemId.set(foodItemId, (quantityByFoodItemId.get(foodItemId) || 0) + quantity);
  }

  return sequelize.transaction(async (t) => {
    // 2. Validate food court
    const foodCourt = await FoodCourt.findByPk(foodCourtId, { transaction: t });
    if (!foodCourt) throw AppError.notFound('Food court not found');
    if (foodCourt.status !== 'ACTIVE') throw AppError.unprocessable('Food court is not currently active');

    // 3+4+5. Validate each food item belongs to the food court, is
    // available, and has sufficient quantity (locks + decrements rows).
    const orderItemsData = [];
    let subtotal = 0;

    for (const [foodItemId, quantity] of quantityByFoodItemId.entries()) {
      const foodItemBefore = await FoodItem.findByPk(foodItemId, { transaction: t });
      if (!foodItemBefore) throw AppError.notFound(`Food item ${foodItemId} not found`);
      if (foodItemBefore.food_court_id !== Number(foodCourtId)) {
        throw AppError.unprocessable(`Food item ${foodItemId} does not belong to the selected food court`);
      }

      // Locks the row and atomically decrements stock; throws on
      // unavailable / insufficient quantity.
      const reserved = await reserveFoodItemQuantity(t, foodItemId, quantity);

      // 8. Calculate prices on backend using the authoritative DB price,
      // never any price the client may have sent.
      const unitPrice = parseFloat(reserved.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      subtotal += lineTotal;

      orderItemsData.push({
        food_item_id: reserved.id,
        item_name_snapshot: reserved.name,
        unit_price_snapshot: unitPrice,
        quantity,
        line_total: lineTotal,
      });
    }

    // 6+7. Validate pickup slot belongs to this food court and reserve
    // capacity (locks the slot row, prevents overbooking).
    const slot = await reserveSlotCapacity(t, pickupSlotId, Number(foodCourtId));

    // Pickup deadline = pickup window after the slot's start time, on the
    // slot's date, computed server-side (never trust a frontend timer).
    const pickupDeadline = computePickupDeadline(slot.slot_date, slot.start_time);

    // A slot whose pickup window has already elapsed cannot be booked into
    // a brand-new order — throwing here rolls back the inventory + capacity
    // reservations already made in this transaction.
    if (pickupDeadline <= new Date()) {
      throw AppError.unprocessable('Selected pickup slot has already passed and cannot be booked');
    }

    // 9. Calculate total on backend (no discounts/fees modeled yet, so
    // total == subtotal; kept as separate fields to match schema/contract).
    const totalAmount = Math.round(subtotal * 100) / 100;

    // 10. Create order
    const order = await Order.create(
      {
        user_id: authenticatedUserId,
        food_court_id: foodCourtId,
        pickup_slot_id: pickupSlotId,
        order_number: generateOrderNumber(),
        subtotal,
        total_amount: totalAmount,
        payment_status: 'PENDING',
        status: 'CONFIRMED',
        pickup_deadline: pickupDeadline,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((item) => ({ ...item, order_id: order.id })),
      { transaction: t }
    );

    return getOrderById(order.id, authenticatedUserId, 'USER', { transaction: t });
  });
}

function computePickupDeadline(slotDate, startTime) {
  // slotDate: 'YYYY-MM-DD', startTime: 'HH:mm:ss'
  const dateStr = typeof slotDate === 'string' ? slotDate : slotDate.toISOString().slice(0, 10);
  const timeStr = String(startTime).slice(0, 8);
  const base = new Date(`${dateStr}T${timeStr}`);
  return new Date(base.getTime() + PICKUP_WINDOW_MINUTES * 60 * 1000);
}

async function getMyOrders(userId) {
  return Order.findAll({
    where: { user_id: userId },
    include: [{ model: OrderItem, as: 'items' }, { model: PickupSlot, as: 'pickupSlot' }],
    order: [['created_at', 'DESC']],
  });
}

/**
 * Fetch a single order, enforcing "own orders only" for USER and
 * "assigned food court only" for SHOPKEEPER (ADMIN sees everything).
 * Never trust an orderId's ownership implicitly — always check.
 */
async function getOrderById(orderId, requesterId, requesterRole, opts = {}) {
  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }, { model: PickupSlot, as: 'pickupSlot' }],
    transaction: opts.transaction,
  });
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (requesterRole === 'ADMIN') {
    return order;
  }
  if (requesterRole === 'USER') {
    if (order.user_id !== requesterId) {
      throw AppError.forbidden('You may only view your own orders');
    }
    return order;
  }
  if (requesterRole === 'SHOPKEEPER') {
    await assertShopkeeperOwnsFoodCourt(requesterId, order.food_court_id);
    return order;
  }
  throw AppError.forbidden('Not authorized to view this order');
}

async function getShopkeeperOrders(shopkeeperUserId, statusFilter) {
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (foodCourtIds.length === 0) return [];

  const where = { food_court_id: foodCourtIds };
  if (statusFilter) where.status = statusFilter;

  return Order.findAll({
    where,
    include: [{ model: OrderItem, as: 'items' }, { model: PickupSlot, as: 'pickupSlot' }],
    order: [['created_at', 'DESC']],
  });
}

/**
 * Enforces the allowed status state machine (Order.ALLOWED_TRANSITIONS) and
 * shopkeeper -> assigned-food-court ownership. Expiry and pickup-related
 * side effects (releasing slot capacity) are handled transactionally here
 * too, so status + capacity never drift apart.
 */
async function updateOrderStatusByShopkeeper(shopkeeperUserId, orderId, nextStatus) {
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw AppError.notFound('Order not found');

    await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, order.food_court_id);

    enforceExpiryIfDue(order);

    const allowed = Order.ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw AppError.unprocessable(
        `Cannot transition order from ${order.status} to ${nextStatus}`
      );
    }

    if (nextStatus === 'PICKED_UP' && order.status !== 'READY') {
      // Belt-and-braces: pickup is expected to go through /pickup/verify in
      // the QR flow (Member 5 + Member 3 per API ownership table), but if a
      // shopkeeper marks it directly, still enforce the same precondition.
      throw AppError.unprocessable('Order must be READY before it can be marked PICKED_UP');
    }

    if (nextStatus === 'CANCELLED' || nextStatus === 'EXPIRED') {
      await restockOrder(t, order);
    }

    order.status = nextStatus;
    await order.save({ transaction: t });
    return order;
  });
}

/** Returns reserved inventory + slot capacity back to the pool. */
async function restockOrder(transaction, order) {
  const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction });
  for (const item of orderItems) {
    const foodItem = await FoodItem.findByPk(item.food_item_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (foodItem) {
      foodItem.quantity_available += item.quantity;
      if (!foodItem.is_available && foodItem.quantity_available > 0) {
        foodItem.is_available = true;
      }
      await foodItem.save({ transaction });
    }
  }
  await releaseSlotCapacity(transaction, order.pickup_slot_id);
}

/** Throws if the order is past its pickup deadline but not yet marked EXPIRED. */
function enforceExpiryIfDue(order) {
  if (['PICKED_UP', 'EXPIRED', 'CANCELLED'].includes(order.status)) return;
  if (new Date() > new Date(order.pickup_deadline)) {
    throw AppError.unprocessable('This order has expired and can no longer be updated');
  }
}

/**
 * Server-side sweep: finds all non-terminal orders past their pickup
 * deadline and flips them to EXPIRED, releasing inventory + slot capacity.
 * Never relies on a frontend timer (MEMBER 3 brief section 7 / ARCHITECTURE.md
 * section 11). Intended to be called periodically by a background job.
 */
async function expireOverdueOrders() {
  const overdue = await Order.findAll({
    where: {
      status: ['CONFIRMED', 'PREPARING', 'READY'],
    },
  });

  const now = new Date();
  let expiredCount = 0;

  for (const order of overdue) {
    if (new Date(order.pickup_deadline) >= now) continue;

    await sequelize.transaction(async (t) => {
      const locked = await Order.findByPk(order.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!locked || ['PICKED_UP', 'EXPIRED', 'CANCELLED'].includes(locked.status)) return;
      if (new Date(locked.pickup_deadline) >= now) return;

      await restockOrder(t, locked);
      locked.status = 'EXPIRED';
      await locked.save({ transaction: t });
      expiredCount += 1;
    });
  }

  return expiredCount;
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getShopkeeperOrders,
  updateOrderStatusByShopkeeper,
  expireOverdueOrders,
  enforceExpiryIfDue,
};
