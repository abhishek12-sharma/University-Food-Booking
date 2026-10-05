const { FoodCourt } = require('../models');
const AppError = require('../utils/AppError');

async function listFoodCourts() {
  return FoodCourt.findAll({
    where: { status: 'ACTIVE' },
    order: [['name', 'ASC']],
  });
}

async function getFoodCourtById(foodCourtId) {
  const foodCourt = await FoodCourt.findByPk(foodCourtId);
  if (!foodCourt) {
    throw AppError.notFound('Food court not found');
  }
  return foodCourt;
}

module.exports = { listFoodCourts, getFoodCourtById };
