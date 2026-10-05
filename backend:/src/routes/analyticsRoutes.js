const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

const router = Router();
// Admin analytics
router.get('/admin/overview', authenticate, requireRole('ADMIN'), ctrl.adminOverview);
router.get('/admin/revenue', authenticate, requireRole('ADMIN'), ctrl.adminRevenue);
router.get('/admin/orders', authenticate, requireRole('ADMIN'), ctrl.adminOrders);
router.get('/admin/food-courts', authenticate, requireRole('ADMIN'), ctrl.adminFoodCourts);
router.get('/admin/popular-food', authenticate, requireRole('ADMIN'), ctrl.adminPopularFood);
router.get('/admin/peak-hours', authenticate, requireRole('ADMIN'), ctrl.adminPeakHours);

// Shopkeeper analytics
router.get('/shopkeeper/overview', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperOverview);
router.get('/shopkeeper/orders', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperOrders);
router.get('/shopkeeper/revenue', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperRevenue);
router.get('/shopkeeper/popular-food', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperPopularFood);
router.get('/shopkeeper/pickup-demand', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperPickupDemand);
router.get('/shopkeeper/waste', authenticate, requireRole('SHOPKEEPER'), ctrl.shopkeeperWaste);

module.exports = router;
