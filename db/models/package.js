'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {

    }
  }
  Package.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        },
    session_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    access_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Package',
    tableName: 'packages'
  });
  return Package;
};
