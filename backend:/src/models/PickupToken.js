const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Stores only a hash of the pickup token, never the raw token (DATABASE_SCHEMA.md).
const PickupToken = sequelize.define(
  'PickupToken',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
    token_hash: { type: DataTypes.STRING(255), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'pickup_tokens',
    updatedAt: false,
  }
);

module.exports = PickupToken;
