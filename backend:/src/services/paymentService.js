/**
 * Razorpay payment integration.
 * Secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) stay server-side only.
 * Payment architecture: ARCHITECTURE.md section 7.
 */
const crypto = require('crypto');
const { Payment, Order } = require('../models');
const AppError = require('../utils/AppError');

// Lazily initialise Razorpay so the service can start even without credentials
// (it will throw a meaningful error at call-time if unconfigured).
function getRazorpay() {
  const Razorpay = require('razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw AppError.internal(
      'Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    );
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function createPaymentOrder(orderId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw AppError.notFound('Order not found');
  if (order.payment_status === 'PAID') throw AppError.conflict('Order is already paid');
  if (!['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) {
    throw AppError.unprocessable('Order is not in a payable state');
  }

  const razorpay = getRazorpay();
  // Amount in paise (INR smallest unit)
  const amountPaise = Math.round(parseFloat(order.total_amount) * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: `order_${order.order_number}`,
  });

  // Upsert payment record
  const [payment] = await Payment.findOrCreate({
    where: { order_id: orderId, status: 'CREATED' },
    defaults: {
      provider: 'razorpay',
      provider_order_id: razorpayOrder.id,
      amount: order.total_amount,
      status: 'CREATED',
      signature_verified: false,
    },
  });
  if (!payment.isNewRecord) {
    payment.provider_order_id = razorpayOrder.id;
    await payment.save();
  }

  return {
    provider_order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
  };
}

async function verifyPayment({ orderId, provider_order_id, provider_payment_id, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw AppError.internal('Payment gateway not configured');

  // Signature verification (DEVELOPMENT_RULES.md: backend decides payment validity)
  const body = `${provider_order_id}|${provider_payment_id}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (expected !== signature) {
    throw AppError.unprocessable('Payment signature verification failed');
  }

  const order = await Order.findByPk(orderId);
  if (!order) throw AppError.notFound('Order not found');
  if (order.payment_status === 'PAID') return { alreadyPaid: true }; // idempotent

  const payment = await Payment.findOne({ where: { order_id: orderId } });
  if (!payment) throw AppError.notFound('Payment record not found');

  payment.provider_payment_id = provider_payment_id;
  payment.status = 'PAID';
  payment.signature_verified = true;
  await payment.save();

  order.payment_status = 'PAID';
  await order.save();

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}

async function handleWebhook(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw AppError.internal('Webhook secret not configured');

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  if (expected !== signature) throw AppError.unprocessable('Invalid webhook signature');

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw AppError.badRequest('Invalid webhook payload');
  }

  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity) {
      const payment = await Payment.findOne({ where: { provider_payment_id: paymentEntity.id } });
      if (payment && payment.status !== 'PAID') {
        payment.status = 'PAID';
        payment.signature_verified = true;
        await payment.save();
        const order = await Order.findByPk(payment.order_id);
        if (order && order.payment_status !== 'PAID') {
          order.payment_status = 'PAID';
          await order.save();
        }
      }
    }
  }

  return { received: true };
}

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
