const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoodCourt = sequelize.define(
  'FoodCourt',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING(255), allowNull: true },
    opening_time: { type: DataTypes.TIME, allowNull: false },
    closing_time: { type: DataTypes.TIME, allowNull: false },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'food_courts',
  }
);

module.exports = FoodCourt;
