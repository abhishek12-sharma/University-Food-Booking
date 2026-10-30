const { body, param } = require('express-validator');

// Helper: accepts a positive integer OR a string that represents one.
// Sequelize serialises BIGINT primary keys as strings in JSON, so we must
// accept both forms here to avoid spurious 422 validation failures.
const isPosInt = (fieldChain) =>
  fieldChain
    .notEmpty().withMessage('must be present')
    .bail()
    .customSanitizer((v) => (typeof v === 'string' ? Number(v) : v))
    .isInt({ min: 1 }).withMessage('must be a positive integer');

const createOrderRules = [
  isPosInt(body('foodCourtId')),
  isPosInt(body('pickupSlotId')),
  body('items')
    .isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  isPosInt(body('items.*.foodItemId')),
  isPosInt(body('items.*.quantity')),
  // Explicitly NOT accepting items.*.price or a top-level total: the
  // backend is authoritative for pricing (DEVELOPMENT_RULES.md section 10).
];

const orderIdParamRule = [
  isPosInt(param('orderId')),
];

const updateOrderStatusRules = [
  isPosInt(param('orderId')),
  body('status')
    .exists().withMessage('status is required')
    .bail()
    .isIn(['PREPARING', 'READY', 'PICKED_UP', 'CANCELLED']).withMessage('invalid status value'),
];

module.exports = { createOrderRules, orderIdParamRule, updateOrderStatusRules };
