const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A shopkeeper's access is determined by this assignment (DATABASE_SCHEMA.md).
const ShopkeeperAssignment = sequelize.define(
  'ShopkeeperAssignment',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    shopkeeper_id: { type: DataTypes.BIGINT, allowNull: false },
    food_court_id: { type: DataTypes.BIGINT, allowNull: false },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'shopkeeper_assignments',
  }
);

module.exports = ShopkeeperAssignment;
