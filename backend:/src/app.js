const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { success } = require('./utils/response');

const foodCourtRoutes = require('./routes/foodCourtRoutes');
const foodItemRoutes = require('./routes/foodItemRoutes');
const pickupSlotRoutes = require('./routes/pickupSlotRoutes');
const orderRoutes = require('./routes/orderRoutes');

// New routes to add:
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const foodWasteRoutes = require('./routes/foodWasteRoutes');
const mlRoutes = require('./routes/mlRoutes');

// Also import getPickupQR from pickup controller for the nested route:
const { getPickupQR } = require('./controllers/pickupController');
const { authenticate, requireRole } = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const allowed = [
        process.env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
      ].filter(Boolean);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General API rate limit (security principle from ARCHITECTURE.md section 16).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/health', (req, res) => success(res, { message: 'OK', data: { status: 'healthy' } }));

// ---- Routes (paths exactly as defined in API_CONTRACT.md) ----

// /api/food-courts, /api/food-courts/:foodCourtId
app.use('/api/food-courts', foodCourtRoutes);

// /api/food-courts/:foodCourtId/food-items (nested, public)
app.use('/api/food-courts/:foodCourtId/food-items', foodItemRoutes.courtScopedRouter);

// /api/food-courts/:foodCourtId/pickup-slots (nested, public)
app.use('/api/food-courts/:foodCourtId/pickup-slots', pickupSlotRoutes.courtScopedRouter);

// /api/food-items/:foodItemId
app.use('/api/food-items', foodItemRoutes.itemRouter);

// /api/shopkeeper/food-items[...]
app.use('/api/shopkeeper/food-items', foodItemRoutes.shopkeeperRouter);

// /api/shopkeeper/pickup-slots[...]
app.use('/api/shopkeeper/pickup-slots', pickupSlotRoutes.shopkeeperRouter);

// /api/orders, /api/orders/my-orders, /api/orders/:orderId
app.use('/api/orders', orderRoutes.userRouter);

// /api/shopkeeper/orders[...]
// /api/shopkeeper/orders[...]
app.use('/api/shopkeeper/orders', orderRoutes.shopkeeperRouter);

// /api/auth
app.use('/api/auth', authRoutes);
// /api/payments
app.use('/api/payments', paymentRoutes);
// /api/pickup
app.use('/api/pickup', pickupRoutes);
// /api/orders/:orderId/pickup-qr — nested on orders router
app.get('/api/orders/:orderId/pickup-qr', authenticate, requireRole('USER'), getPickupQR);
// /api/admin
app.use('/api/admin', adminRoutes);
// /api/analytics
app.use('/api/analytics', analyticsRoutes);
// /api/notifications
app.use('/api/notifications', notificationRoutes);
// /api/shopkeeper/food-waste
app.use('/api/shopkeeper/food-waste', foodWasteRoutes);
// /api/predict-demand
app.use('/api/predict-demand', mlRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
