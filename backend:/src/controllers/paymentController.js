const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const paymentService = require('../services/paymentService');
const AppError = require('../utils/AppError');

exports.create = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw AppError.unprocessable('orderId is required');
  const payment = await paymentService.createPaymentOrder(Number(orderId));
  success(res, { message: 'Payment order created', data: { payment } }, 201);
});

exports.verify = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.body);
  success(res, { message: 'Payment verified', data: result });
});

exports.webhook = asyncHandler(async (req, res) => {
  // Razorpay sends raw body — must be read as Buffer/string.
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) throw AppError.badRequest('Missing webhook signature');
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const result = await paymentService.handleWebhook(rawBody, signature);
  success(res, { message: 'Webhook processed', data: result });
});
