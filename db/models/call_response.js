'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CallResponse extends Model {
    static associate(models) {
    }
  }
  CallResponse.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: DataTypes.STRING,
    description : DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'CallResponse',
    tableName: 'call_responses',
  });
  return CallResponse;
};
