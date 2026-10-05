const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoodWaste = sequelize.define(
  'FoodWaste',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    food_court_id: { type: DataTypes.BIGINT, allowNull: false },
    food_item_id: { type: DataTypes.BIGINT, allowNull: false },
    waste_date: { type: DataTypes.DATEONLY, allowNull: false },
    prepared_quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    sold_quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    remaining_quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    wasted_quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    recorded_by: { type: DataTypes.BIGINT, allowNull: false },
  },
  {
    tableName: 'food_waste',
    updatedAt: false,
    indexes: [{ fields: ['food_court_id', 'waste_date'] }],
  }
);

module.exports = FoodWaste;
