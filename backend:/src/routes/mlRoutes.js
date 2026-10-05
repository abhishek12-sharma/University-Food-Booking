const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/mlController');

const router = Router();
// SHOPKEEPER can request demand predictions for their food court
router.post('/', authenticate, requireRole('SHOPKEEPER', 'ADMIN'), ctrl.predictDemand);
module.exports = router;
