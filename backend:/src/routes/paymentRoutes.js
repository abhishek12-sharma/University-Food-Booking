const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = Router();

// Authenticated user creates payment order
router.post('/create', authenticate, requireRole('USER'), ctrl.create);
// Authenticated user verifies after payment gateway callback
router.post('/verify', authenticate, requireRole('USER'), ctrl.verify);
// Webhook — no auth middleware, verified by signature inside handler
router.post('/webhook', ctrl.webhook);

module.exports = router;
