const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/foodWasteController');

const router = Router();
router.post('/', authenticate, requireRole('SHOPKEEPER'), ctrl.recordWaste);
router.get('/', authenticate, requireRole('SHOPKEEPER'), ctrl.getWaste);
module.exports = router;
