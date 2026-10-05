const { body, param } = require('express-validator');

const createFoodItemRules = [
  body('foodCourtId')
    .exists().withMessage('foodCourtId is required')
    .bail()
    .isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer'),
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .bail()
    .isLength({ max: 180 }).withMessage('name must be at most 180 characters'),
  body('description').optional({ nullable: true }).isString(),
  body('category').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('price')
    .exists().withMessage('price is required')
    .bail()
    .isFloat({ gt: 0 }).withMessage('price must be a positive number'),
  body('quantityAvailable')
    .exists().withMessage('quantityAvailable is required')
    .bail()
    .isInt({ min: 0 }).withMessage('quantityAvailable must be a non-negative integer'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
  body('imageUrl').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

const updateFoodItemRules = [
  param('foodItemId').isInt({ min: 1 }).withMessage('foodItemId must be a positive integer'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 180 }),
  body('description').optional({ nullable: true }).isString(),
  body('category').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('price').optional().isFloat({ gt: 0 }).withMessage('price must be a positive number'),
  body('quantityAvailable').optional().isInt({ min: 0 }).withMessage('quantityAvailable must be a non-negative integer'),
  body('isAvailable').optional().isBoolean(),
  body('imageUrl').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

const foodItemIdParamRule = [param('foodItemId').isInt({ min: 1 }).withMessage('foodItemId must be a positive integer')];
const foodCourtIdParamRule = [param('foodCourtId').isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer')];

module.exports = {
  createFoodItemRules,
  updateFoodItemRules,
  foodItemIdParamRule,
  foodCourtIdParamRule,
};
