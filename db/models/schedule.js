'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
       Schedule.belongsTo(models.Agent, {
            foreignKey: 'agent_id',
            as: 'agent',
        });
    }
  }
  Schedule.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    agent_id: DataTypes.UUID,
    schedule_time: DataTypes.DATE,
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
    modelName: 'Schedule',
    tableName: 'schedules',
  });
  return Schedule;
};
