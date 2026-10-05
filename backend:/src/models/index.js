const sequelize = require('../config/database');

const User = require('./User');
const FoodCourt = require('./FoodCourt');
const ShopkeeperAssignment = require('./ShopkeeperAssignment');
const FoodItem = require('./FoodItem');
const PickupSlot = require('./PickupSlot');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const PickupToken = require('./PickupToken');
const Notification = require('./Notification');
const FoodWaste = require('./FoodWaste');
const AuditLog = require('./AuditLog');

// ---- users ----
User.hasMany(ShopkeeperAssignment, { foreignKey: 'shopkeeper_id', as: 'assignments' });
ShopkeeperAssignment.belongsTo(User, { foreignKey: 'shopkeeper_id', as: 'shopkeeper' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'actor_user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

User.hasMany(FoodWaste, { foreignKey: 'recorded_by', as: 'wasteRecords' });
FoodWaste.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// ---- food courts ----
FoodCourt.hasMany(FoodItem, { foreignKey: 'food_court_id', as: 'foodItems' });
FoodItem.belongsTo(FoodCourt, { foreignKey: 'food_court_id', as: 'foodCourt' });

FoodCourt.hasMany(PickupSlot, { foreignKey: 'food_court_id', as: 'pickupSlots' });
PickupSlot.belongsTo(FoodCourt, { foreignKey: 'food_court_id', as: 'foodCourt' });

FoodCourt.hasMany(Order, { foreignKey: 'food_court_id', as: 'orders' });
Order.belongsTo(FoodCourt, { foreignKey: 'food_court_id', as: 'foodCourt' });

FoodCourt.hasMany(ShopkeeperAssignment, { foreignKey: 'food_court_id', as: 'shopkeeperAssignments' });
ShopkeeperAssignment.belongsTo(FoodCourt, { foreignKey: 'food_court_id', as: 'foodCourt' });

FoodCourt.hasMany(FoodWaste, { foreignKey: 'food_court_id', as: 'wasteRecords' });
FoodWaste.belongsTo(FoodCourt, { foreignKey: 'food_court_id', as: 'foodCourt' });

// ---- orders ----
PickupSlot.hasMany(Order, { foreignKey: 'pickup_slot_id', as: 'orders' });
Order.belongsTo(PickupSlot, { foreignKey: 'pickup_slot_id', as: 'pickupSlot' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(PickupToken, { foreignKey: 'order_id', as: 'pickupToken' });
PickupToken.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// ---- food items ----
FoodItem.hasMany(OrderItem, { foreignKey: 'food_item_id', as: 'orderItems' });
OrderItem.belongsTo(FoodItem, { foreignKey: 'food_item_id', as: 'foodItem' });

FoodItem.hasMany(FoodWaste, { foreignKey: 'food_item_id', as: 'wasteRecords' });
FoodWaste.belongsTo(FoodItem, { foreignKey: 'food_item_id', as: 'foodItem' });

module.exports = {
  sequelize,
  User,
  FoodCourt,
  ShopkeeperAssignment,
  FoodItem,
  PickupSlot,
  Order,
  OrderItem,
  Payment,
  PickupToken,
  Notification,
  FoodWaste,
  AuditLog,
};
