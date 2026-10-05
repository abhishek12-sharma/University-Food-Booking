const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Snapshots preserve what the user ordered even if the menu later changes
// (DATABASE_SCHEMA.md). Never re-read live FoodItem price/name once an
// order exists.
const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    food_item_id: { type: DataTypes.BIGINT, allowNull: false },
    item_name_snapshot: { type: DataTypes.STRING(180), allowNull: false },
    unit_price_snapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    tableName: 'order_items',
    timestamps: false,
  }
);

module.exports = OrderItem;
