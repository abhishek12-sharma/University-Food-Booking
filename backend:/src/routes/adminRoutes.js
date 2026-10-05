const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const router = Router();
const isAdmin = [authenticate, requireRole('ADMIN')];

router.get('/dashboard', ...isAdmin, ctrl.getDashboard);

router.get('/users', ...isAdmin, ctrl.getUsers);
router.get('/users/:userId', ...isAdmin, ctrl.getUserById);
router.patch('/users/:userId/status', ...isAdmin, ctrl.updateUserStatus);

router.get('/shopkeepers', ...isAdmin, ctrl.getShopkeepers);
router.get('/shopkeepers/:id', ...isAdmin, ctrl.getShopkeeperById);
router.post('/shopkeepers/:id/approve', ...isAdmin, ctrl.approveShopkeeper);
router.post('/shopkeepers/:id/reject', ...isAdmin, ctrl.rejectShopkeeper);
router.patch('/shopkeepers/:id/status', ...isAdmin, ctrl.updateShopkeeperStatus);

router.get('/food-courts', ...isAdmin, ctrl.getFoodCourts);
router.post('/food-courts', ...isAdmin, ctrl.createFoodCourt);
router.get('/food-courts/:id', ...isAdmin, ctrl.getFoodCourtById);
router.put('/food-courts/:id', ...isAdmin, ctrl.updateFoodCourt);
router.patch('/food-courts/:id/status', ...isAdmin, ctrl.updateFoodCourtStatus);

router.get('/orders', ...isAdmin, ctrl.getOrders);
router.get('/orders/:orderId', ...isAdmin, ctrl.getOrderById);

router.get('/payments', ...isAdmin, ctrl.getPayments);

router.get('/audit-logs', ...isAdmin, ctrl.getAuditLogs);

module.exports = router;
