const express = require('express');
const controller = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { createOrderRules, orderIdParamRule, updateOrderStatusRules } = require('../validators/orderValidator');

// Mounted at /api/orders
const userRouter = express.Router();
userRouter.use(authenticate);
userRouter.post('/', requireRole('USER'), createOrderRules, validate, controller.createOrder);
userRouter.get('/my-orders', requireRole('USER'), controller.getMyOrders);
// USER/SHOPKEEPER/ADMIN can all hit this; per-request ownership is enforced
// in the service layer (getOrderById), not by role alone.
userRouter.get('/:orderId', orderIdParamRule, validate, controller.getOrder);

// Mounted at /api/shopkeeper/orders
const shopkeeperRouter = express.Router();
shopkeeperRouter.use(authenticate, requireRole('SHOPKEEPER'));
shopkeeperRouter.get('/', controller.getShopkeeperOrders);
shopkeeperRouter.patch('/:orderId/status', updateOrderStatusRules, validate, controller.updateOrderStatus);

module.exports = { userRouter, shopkeeperRouter };
