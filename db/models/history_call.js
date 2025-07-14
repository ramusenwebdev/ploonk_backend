'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoryCall extends Model {
    static associate(models) {
      // HistoryCall dimiliki oleh seorang User
      HistoryCall.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      // HistoryCall melibatkan seorang Agent
      HistoryCall.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  HistoryCall.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: DataTypes.UUID,
    agent_id: DataTypes.UUID,
    unique_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    duration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'HistoryCall',
    tableName: 'history_calls',
  });
  return HistoryCall;
};
