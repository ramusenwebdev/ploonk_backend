'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      // Appointment dimiliki oleh seorang User
      Appointment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      // Appointment dilayani oleh seorang Agent
      Appointment.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
      // Appointment berasal dari sebuah AvailableSlot
      Appointment.belongsTo(models.AvailableSlot, { foreignKey: 'slot_id', as: 'slot' });
    }
  }
  Appointment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: DataTypes.UUID,
    agent_id: DataTypes.UUID,
    slot_id: DataTypes.UUID,
    appointment_time: DataTypes.DATE,
    type: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
  });
  return Appointment;
};
