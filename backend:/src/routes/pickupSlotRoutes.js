const express = require('express');
const controller = require('../controllers/pickupSlotController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createPickupSlotRules,
  updateSlotStatusRules,
  foodCourtIdParamRule,
} = require('../validators/pickupValidator');

// Mounted at /api/food-courts/:foodCourtId/pickup-slots
const courtScopedRouter = express.Router({ mergeParams: true });
courtScopedRouter.get('/', foodCourtIdParamRule, validate, controller.listPickupSlots);

// Mounted at /api/shopkeeper/pickup-slots
const shopkeeperRouter = express.Router();
shopkeeperRouter.use(authenticate, requireRole('SHOPKEEPER'));
shopkeeperRouter.post('/', createPickupSlotRules, validate, controller.createPickupSlot);
shopkeeperRouter.patch('/:slotId/status', updateSlotStatusRules, validate, controller.updatePickupSlotStatus);

module.exports = { courtScopedRouter, shopkeeperRouter };
