const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Owned jointly with Member 6 per API_CONTRACT.md ownership table.
// Member 3 exposes this table/model so order flows can read payment_status
// consistency, but payment gateway orchestration itself is Member 6's.
const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    provider: { type: DataTypes.STRING(50), allowNull: false },
    provider_order_id: { type: DataTypes.STRING(150), allowNull: true },
    provider_payment_id: { type: DataTypes.STRING(150), allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('CREATED', 'PAID', 'FAILED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'CREATED',
    },
    signature_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: 'payments',
    indexes: [{ fields: ['order_id'] }, { fields: ['provider_payment_id'] }],
  }
);

module.exports = Payment;
