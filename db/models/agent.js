'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Agent.hasMany(models.Schedule, {
            foreignKey: 'agent_id',
            as: 'slots'
        });
    }
  }
  Agent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bio: DataTypes.TEXT,
    sip: DataTypes.STRING,
    status: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'Agent',
    tableName: 'agents',
  });
  return Agent;
};
