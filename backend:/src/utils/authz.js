const { ShopkeeperAssignment } = require('../models');
const AppError = require('../utils/AppError');

/**
 * A shopkeeper's access is determined solely by an ACTIVE row in
 * shopkeeper_assignments (DATABASE_SCHEMA.md). Every shopkeeper-scoped
 * write must call this before touching data — never trust a foodCourtId
 * supplied by the frontend/body without this check.
 */
async function assertShopkeeperOwnsFoodCourt(shopkeeperUserId, foodCourtId) {
  const assignment = await ShopkeeperAssignment.findOne({
    where: {
      shopkeeper_id: shopkeeperUserId,
      food_court_id: foodCourtId,
      status: 'ACTIVE',
    },
  });
  if (!assignment) {
    throw AppError.forbidden('You are not assigned to this food court');
  }
  return assignment;
}

/** Returns the list of food_court_ids a shopkeeper is actively assigned to. */
async function getAssignedFoodCourtIds(shopkeeperUserId) {
  const assignments = await ShopkeeperAssignment.findAll({
    where: { shopkeeper_id: shopkeeperUserId, status: 'ACTIVE' },
    attributes: ['food_court_id'],
  });
  return assignments.map((a) => a.food_court_id);
}

module.exports = { assertShopkeeperOwnsFoodCourt, getAssignedFoodCourtIds };
