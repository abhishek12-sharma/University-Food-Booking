const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/foodCourtController');

// GET /api/food-courts
router.get('/', controller.listFoodCourts);

// GET /api/food-courts/:foodCourtId
router.get(
  '/:foodCourtId',
  [param('foodCourtId').isInt({ min: 1 }).withMessage('foodCourtId must be a positive integer')],
  validate,
  controller.getFoodCourt
);

module.exports = router;
