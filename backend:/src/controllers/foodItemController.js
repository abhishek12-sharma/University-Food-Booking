const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const foodItemService = require('../services/foodItemService');

const listFoodItemsByFoodCourt = asyncHandler(async (req, res) => {
  const foodItems = await foodItemService.listFoodItemsByFoodCourt(req.params.foodCourtId);
  return success(res, { message: 'Food items retrieved', data: { foodItems } });
});

const getFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await foodItemService.getFoodItemById(req.params.foodItemId);
  return success(res, { message: 'Food item retrieved', data: { foodItem } });
});

const createFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await foodItemService.createFoodItem(req.user.id, req.body);
  return success(res, { message: 'Food item created', data: { foodItem }, statusCode: 201 });
});

const updateFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await foodItemService.updateFoodItem(req.user.id, req.params.foodItemId, req.body);
  return success(res, { message: 'Food item updated', data: { foodItem } });
});

const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await foodItemService.deleteFoodItem(req.user.id, req.params.foodItemId);
  return success(res, { message: 'Food item deactivated', data: { foodItem } });
});

const updateInventory = asyncHandler(async (req, res) => {
  // Accepts { quantity_available?, is_available? } — partial update
  const { quantity_available, is_available } = req.body;
  const payload = {};
  if (quantity_available !== undefined) payload.quantity_available = quantity_available;
  if (is_available !== undefined) payload.is_available = is_available;
  const foodItem = await foodItemService.updateFoodItem(req.user.id, req.params.foodItemId, payload);
  return success(res, { message: 'Inventory updated', data: { foodItem } });
});

module.exports = {
  listFoodItemsByFoodCourt,
  getFoodItem,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  updateInventory,
};
