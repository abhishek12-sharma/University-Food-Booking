const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const notificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  success(res, { message: 'Notifications fetched', data: { notifications } });
});

exports.markRead = asyncHandler(async (req, res) => {
  try {
    const n = await notificationService.markAsRead(Number(req.params.id), req.user.id);
    success(res, { message: 'Marked as read', data: { notification: n } });
  } catch (err) {
    if (err.message === 'Notification not found') throw AppError.notFound('Notification not found');
    if (err.message === 'Forbidden') throw AppError.forbidden();
    throw err;
  }
});
