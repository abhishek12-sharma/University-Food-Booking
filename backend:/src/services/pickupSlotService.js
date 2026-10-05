const { PickupSlot, FoodCourt } = require('../models');
const AppError = require('../utils/AppError');
const { assertShopkeeperOwnsFoodCourt } = require('../utils/authz');

async function listPickupSlotsByFoodCourt(foodCourtId) {
  const foodCourt = await FoodCourt.findByPk(foodCourtId);
  if (!foodCourt) {
    throw AppError.notFound('Food court not found');
  }
  return PickupSlot.findAll({
    where: { food_court_id: foodCourtId, status: 'ACTIVE' },
    order: [
      ['slot_date', 'ASC'],
      ['start_time', 'ASC'],
    ],
  });
}

async function createPickupSlot(shopkeeperUserId, payload) {
  const { foodCourtId, slotDate, startTime, endTime, capacity } = payload;

  await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, foodCourtId);

  if (startTime >= endTime) {
    throw AppError.unprocessable('startTime must be before endTime');
  }
  if (capacity <= 0) {
    throw AppError.unprocessable('capacity must be greater than 0');
  }

  return PickupSlot.create({
    food_court_id: foodCourtId,
    slot_date: slotDate,
    start_time: startTime,
    end_time: endTime,
    capacity,
    booked_count: 0,
    status: 'ACTIVE',
  });
}

async function updatePickupSlotStatus(shopkeeperUserId, slotId, status) {
  const slot = await PickupSlot.findByPk(slotId);
  if (!slot) {
    throw AppError.notFound('Pickup slot not found');
  }

  await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, slot.food_court_id);

  if (status === 'ACTIVE' && slot.booked_count >= slot.capacity) {
    // Can't reactivate a slot that is already at/over capacity.
    throw AppError.conflict('Cannot activate a slot that is already full');
  }

  slot.status = status;
  await slot.save();
  return slot;
}

/**
 * Locks the pickup slot row and reserves one booking's worth of capacity.
 * Must run inside the same transaction as order creation (DATABASE_SCHEMA.md:
 * "Use transactions when reserving capacity"; MEMBER 3 brief section 4:
 * "Prevent overbooking").
 */
async function reserveSlotCapacity(transaction, slotId, foodCourtId) {
  const slot = await PickupSlot.findByPk(slotId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!slot) {
    throw AppError.notFound('Pickup slot not found');
  }
  if (slot.food_court_id !== foodCourtId) {
    throw AppError.unprocessable('Pickup slot does not belong to the specified food court');
  }
  if (slot.status !== 'ACTIVE') {
    throw AppError.unprocessable('Pickup slot is not active');
  }
  if (slot.booked_count >= slot.capacity) {
    throw AppError.conflict('Pickup slot is fully booked');
  }

  slot.booked_count += 1;
  if (slot.booked_count >= slot.capacity) {
    slot.status = 'FULL';
  }
  await slot.save({ transaction });
  return slot;
}

/**
 * Releases one unit of booked capacity (used on cancellation/expiry) inside
 * the caller's transaction.
 */
async function releaseSlotCapacity(transaction, slotId) {
  const slot = await PickupSlot.findByPk(slotId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!slot) return null;

  slot.booked_count = Math.max(0, slot.booked_count - 1);
  if (slot.status === 'FULL' && slot.booked_count < slot.capacity) {
    slot.status = 'ACTIVE';
  }
  await slot.save({ transaction });
  return slot;
}

module.exports = {
  listPickupSlotsByFoodCourt,
  createPickupSlot,
  updatePickupSlotStatus,
  reserveSlotCapacity,
  releaseSlotCapacity,
};
