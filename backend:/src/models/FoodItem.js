const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoodItem = sequelize.define(
  'FoodItem',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    food_court_id: { type: DataTypes.BIGINT, allowNull: false },
    name: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'food_items',
    indexes: [{ fields: ['food_court_id'] }, { fields: ['is_available'] }],
  }
);

module.exports = FoodItem;
