const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { verifyPickup } = require('../controllers/pickupController');

const router = Router();
// POST /api/pickup/verify — shopkeeper verifies a QR token
router.post('/verify', authenticate, requireRole('SHOPKEEPER'), verifyPickup);
module.exports = router;
