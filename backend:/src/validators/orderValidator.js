const { body, param } = require('express-validator');

const createOrderRules = [
  body('foodCourtId').isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer'),
  body('pickupSlotId').isInt({ min: 1 }).withMessage('pickupSlotId must be a positive integer'),
  body('items')
    .isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.foodItemId').isInt({ min: 1 }).withMessage('items[].foodItemId must be a positive integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('items[].quantity must be a positive integer'),
  // Explicitly NOT accepting items.*.price or a top-level total: the
  // backend is authoritative for pricing (DEVELOPMENT_RULES.md section 10).
];

const orderIdParamRule = [param('orderId').isInt({ min: 1 }).withMessage('orderId must be a positive integer')];

const updateOrderStatusRules = [
  param('orderId').isInt({ min: 1 }).withMessage('orderId must be a positive integer'),
  body('status')
    .exists().withMessage('status is required')
    .bail()
    .isIn(['PREPARING', 'READY', 'PICKED_UP', 'CANCELLED']).withMessage('invalid status value'),
];

module.exports = { createOrderRules, orderIdParamRule, updateOrderStatusRules };
