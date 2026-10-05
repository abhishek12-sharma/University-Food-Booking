const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = Router();
router.get('/', authenticate, ctrl.getNotifications);
router.patch('/:id/read', authenticate, ctrl.markRead);
module.exports = router;
