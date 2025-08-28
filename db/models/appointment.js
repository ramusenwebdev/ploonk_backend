'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Appointment.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
      Appointment.belongsTo(models.Schedule, { foreignKey: 'schedule_id', as: 'schedule' });
      Appointment.belongsTo(models.CallResponse, { foreignKey: 'response_type_id', as: 'call_response' });

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
    schedule_id: DataTypes.UUID,
    response_type_id:DataTypes.UUID,
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
