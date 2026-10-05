const { FoodItem } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Locks a food item row (SELECT ... FOR UPDATE) inside an existing
 * transaction and atomically decrements quantity_available. Must always be
 * called with the same `transaction` the order row is written in, so a
 * partial failure rolls back both together (DATABASE_SCHEMA.md section 6,
 * MEMBER 3 brief section 8: prevent negative inventory / race-condition
 * overselling).
 */
async function reserveFoodItemQuantity(transaction, foodItemId, quantity) {
  const foodItem = await FoodItem.findByPk(foodItemId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!foodItem) {
    throw AppError.notFound(`Food item ${foodItemId} not found`);
  }
  if (!foodItem.is_available) {
    throw AppError.unprocessable(`Food item "${foodItem.name}" is not currently available`);
  }
  if (foodItem.quantity_available < quantity) {
    throw AppError.conflict(
      `Insufficient quantity for "${foodItem.name}": requested ${quantity}, available ${foodItem.quantity_available}`
    );
  }

  foodItem.quantity_available -= quantity;
  if (foodItem.quantity_available === 0) {
    // Optional convenience: auto-flip availability off when stock hits zero.
    foodItem.is_available = false;
  }
  await foodItem.save({ transaction });
  return foodItem;
}

module.exports = { reserveFoodItemQuantity };
