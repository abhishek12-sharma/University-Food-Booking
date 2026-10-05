const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/change-password', authenticate, ctrl.changePassword);

module.exports = router;
