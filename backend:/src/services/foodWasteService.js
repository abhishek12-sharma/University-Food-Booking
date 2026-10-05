const { FoodWaste, FoodItem, FoodCourt } = require('../models');
const { getAssignedFoodCourtIds } = require('../utils/authz');
const AppError = require('../utils/AppError');

async function recordWaste(shopkeeperUserId, payload) {
  const { foodItemId, wasteDate, preparedQuantity, soldQuantity, remainingQuantity, wastedQuantity } = payload;
  // Validate non-negative
  if ([preparedQuantity, soldQuantity, remainingQuantity, wastedQuantity].some(v => v < 0)) {
    throw AppError.unprocessable('Quantities must be non-negative');
  }
  if (wastedQuantity > preparedQuantity) {
    throw AppError.unprocessable('Wasted quantity cannot exceed prepared quantity');
  }
  const foodItem = await FoodItem.findByPk(foodItemId);
  if (!foodItem) throw AppError.notFound('Food item not found');
  const assignedIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!assignedIds.includes(foodItem.food_court_id)) {
    throw AppError.forbidden('Food item does not belong to your food court');
  }
  return FoodWaste.create({
    food_court_id: foodItem.food_court_id,
    food_item_id: foodItemId,
    waste_date: wasteDate,
    prepared_quantity: preparedQuantity,
    sold_quantity: soldQuantity,
    remaining_quantity: remainingQuantity,
    wasted_quantity: wastedQuantity,
    recorded_by: shopkeeperUserId,
  });
}

async function getWasteRecords(shopkeeperUserId) {
  const assignedIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (assignedIds.length === 0) return [];
  return FoodWaste.findAll({
    where: { food_court_id: assignedIds },
    include: [{ model: FoodItem, as: 'foodItem', attributes: ['id','name','category'] }],
    order: [['waste_date', 'DESC'], ['created_at', 'DESC']],
  });
}

module.exports = { recordWaste, getWasteRecords };
