const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    actor_user_id: { type: DataTypes.BIGINT, allowNull: false },
    action: { type: DataTypes.STRING(100), allowNull: false },
    resource_type: { type: DataTypes.STRING(100), allowNull: false },
    resource_id: { type: DataTypes.BIGINT, allowNull: true },
    metadata_json: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: 'audit_logs',
    updatedAt: false,
  }
);

module.exports = AuditLog;
