const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PickupSlot = sequelize.define(
  'PickupSlot',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    food_court_id: { type: DataTypes.BIGINT, allowNull: false },
    slot_date: { type: DataTypes.DATEONLY, allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    booked_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'FULL'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'pickup_slots',
    indexes: [{ fields: ['food_court_id', 'slot_date'] }],
  }
);

module.exports = PickupSlot;
