const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Note: Member 3 owns this table's structure (shared with Member 1's auth
// module) but does NOT own registration/login/password logic — that is
// Member 1's responsibility. This model exists here because core backend
// APIs (orders, shopkeeper assignment checks, etc.) need to read/join users.
const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('ADMIN', 'SHOPKEEPER', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'users',
    indexes: [{ fields: ['email'] }, { fields: ['role'] }],
  }
);

module.exports = User;
