const { Notification } = require('../models');

async function createNotification(userId, { type, title, message }) {
  return Notification.create({ user_id: userId, type, title, message, is_read: false });
}

async function getUserNotifications(userId) {
  return Notification.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 50,
  });
}

async function markAsRead(notificationId, userId) {
  const n = await Notification.findByPk(notificationId);
  if (!n) throw new Error('Notification not found');
  if (n.user_id !== userId) throw new Error('Forbidden');
  n.is_read = true;
  await n.save();
  return n;
}

module.exports = { createNotification, getUserNotifications, markAsRead };
