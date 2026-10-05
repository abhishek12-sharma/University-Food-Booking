const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    food_court_id: { type: DataTypes.BIGINT, allowNull: false },
    pickup_slot_id: { type: DataTypes.BIGINT, allowNull: false },
    order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    status: {
      type: DataTypes.ENUM('CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'EXPIRED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CONFIRMED',
    },
    pickup_deadline: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: 'orders',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['food_court_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
      { fields: ['pickup_slot_id'] },
    ],
  }
);

// Allowed status transitions, enforced centrally so no controller/service
// can silently perform an arbitrary status change (project rule).
Order.ALLOWED_TRANSITIONS = {
  CONFIRMED: ['PREPARING', 'CANCELLED', 'EXPIRED'],
  PREPARING: ['READY', 'CANCELLED', 'EXPIRED'],
  READY: ['PICKED_UP', 'EXPIRED'],
  PICKED_UP: [],
  EXPIRED: [],
  CANCELLED: [],
};

module.exports = Order;
