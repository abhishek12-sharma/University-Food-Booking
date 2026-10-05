const express = require('express');
const controller = require('../controllers/foodItemController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createFoodItemRules,
  updateFoodItemRules,
  foodItemIdParamRule,
  foodCourtIdParamRule,
} = require('../validators/foodValidator');

// Mounted at /api/food-courts/:foodCourtId/food-items (mergeParams so
// :foodCourtId from the parent router is visible here).
const courtScopedRouter = express.Router({ mergeParams: true });
courtScopedRouter.get('/', foodCourtIdParamRule, validate, controller.listFoodItemsByFoodCourt);

// Mounted at /api/food-items
const itemRouter = express.Router();
itemRouter.get('/:foodItemId', foodItemIdParamRule, validate, controller.getFoodItem);

// Mounted at /api/shopkeeper/food-items
const shopkeeperRouter = express.Router();
shopkeeperRouter.use(authenticate, requireRole('SHOPKEEPER'));
shopkeeperRouter.post('/', createFoodItemRules, validate, controller.createFoodItem);
shopkeeperRouter.put('/:foodItemId', updateFoodItemRules, validate, controller.updateFoodItem);
shopkeeperRouter.delete('/:foodItemId', foodItemIdParamRule, validate, controller.deleteFoodItem);
shopkeeperRouter.patch('/:foodItemId/inventory', foodItemIdParamRule, validate, controller.updateInventory);

module.exports = { courtScopedRouter, itemRouter, shopkeeperRouter };
