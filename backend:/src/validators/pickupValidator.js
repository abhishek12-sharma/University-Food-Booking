const { body, param } = require('express-validator');

const createPickupSlotRules = [
  body('foodCourtId').isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer'),
  body('slotDate')
    .exists().withMessage('slotDate is required')
    .bail()
    .isISO8601().withMessage('slotDate must be a valid date (YYYY-MM-DD)'),
  body('startTime')
    .exists().withMessage('startTime is required')
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('startTime must be HH:mm or HH:mm:ss'),
  body('endTime')
    .exists().withMessage('endTime is required')
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('endTime must be HH:mm or HH:mm:ss'),
  body('capacity')
    .exists().withMessage('capacity is required')
    .bail()
    .isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
];

const updateSlotStatusRules = [
  param('slotId').isInt({ min: 1 }).withMessage('slotId must be a positive integer'),
  body('status')
    .exists().withMessage('status is required')
    .bail()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
];

const foodCourtIdParamRule = [param('foodCourtId').isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer')];

module.exports = { createPickupSlotRules, updateSlotStatusRules, foodCourtIdParamRule };
