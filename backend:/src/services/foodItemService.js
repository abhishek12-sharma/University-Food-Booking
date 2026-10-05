const { FoodItem, FoodCourt } = require('../models');
const AppError = require('../utils/AppError');
const { assertShopkeeperOwnsFoodCourt } = require('../utils/authz');

async function listFoodItemsByFoodCourt(foodCourtId) {
  const foodCourt = await FoodCourt.findByPk(foodCourtId);
  if (!foodCourt) {
    throw AppError.notFound('Food court not found');
  }
  return FoodItem.findAll({
    where: { food_court_id: foodCourtId },
    order: [['name', 'ASC']],
  });
}

async function getFoodItemById(foodItemId) {
  const foodItem = await FoodItem.findByPk(foodItemId);
  if (!foodItem) {
    throw AppError.notFound('Food item not found');
  }
  return foodItem;
}

async function createFoodItem(shopkeeperUserId, payload) {
  const { foodCourtId, name, description, category, price, quantityAvailable, isAvailable, imageUrl } = payload;

  await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, foodCourtId);

  const foodCourt = await FoodCourt.findByPk(foodCourtId);
  if (!foodCourt) {
    throw AppError.notFound('Food court not found');
  }

  if (price <= 0) throw AppError.unprocessable('price must be greater than 0');
  if (quantityAvailable < 0) throw AppError.unprocessable('quantityAvailable cannot be negative');

  return FoodItem.create({
    food_court_id: foodCourtId,
    name,
    description: description ?? null,
    category: category ?? null,
    price,
    quantity_available: quantityAvailable,
    is_available: isAvailable ?? true,
    image_url: imageUrl ?? null,
  });
}

async function updateFoodItem(shopkeeperUserId, foodItemId, payload) {
  const foodItem = await FoodItem.findByPk(foodItemId);
  if (!foodItem) {
    throw AppError.notFound('Food item not found');
  }

  // A shopkeeper must not modify another shopkeeper's food court (MEMBER 3 brief).
  await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, foodItem.food_court_id);

  const { name, description, category, price, quantityAvailable, isAvailable, imageUrl } = payload;

  if (price !== undefined && price <= 0) throw AppError.unprocessable('price must be greater than 0');
  if (quantityAvailable !== undefined && quantityAvailable < 0) {
    throw AppError.unprocessable('quantityAvailable cannot be negative');
  }

  if (name !== undefined) foodItem.name = name;
  if (description !== undefined) foodItem.description = description;
  if (category !== undefined) foodItem.category = category;
  if (price !== undefined) foodItem.price = price;
  if (quantityAvailable !== undefined) foodItem.quantity_available = quantityAvailable;
  if (isAvailable !== undefined) foodItem.is_available = isAvailable;
  if (imageUrl !== undefined) foodItem.image_url = imageUrl;

  await foodItem.save();
  return foodItem;
}

async function deleteFoodItem(shopkeeperUserId, foodItemId) {
  const foodItem = await FoodItem.findByPk(foodItemId);
  if (!foodItem) {
    throw AppError.notFound('Food item not found');
  }

  await assertShopkeeperOwnsFoodCourt(shopkeeperUserId, foodItem.food_court_id);

  // Soft "remove": deactivate rather than hard-delete, so historical
  // order_items (which snapshot name/price) keep a valid foreign key.
  foodItem.is_available = false;
  foodItem.quantity_available = 0;
  await foodItem.save();
  return foodItem;
}

module.exports = {
  listFoodItemsByFoodCourt,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
