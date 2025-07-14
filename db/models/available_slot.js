'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AvailableSlot extends Model {
    static associate(models) {
      AvailableSlot.belongsTo(models.Agent, {
        foreignKey: 'agent_id',
        as: 'agent'
      });
    }
  }
  AvailableSlot.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    agent_id: DataTypes.UUID,
    start_time: DataTypes.DATE,
    duration_minutes: DataTypes.INTEGER,
    slot_access_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_booked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'AvailableSlot',
    tableName: 'available_slots',
  });
  return AvailableSlot;
};
