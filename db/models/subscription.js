'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Subscription.belongsTo(models.Package, {
        foreignKey: 'package_id',
        as: 'package'
      });
    }
  }
  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: DataTypes.UUID,
    package_id: DataTypes.UUID,
    sessions_remaining: DataTypes.INTEGER,
    duration_remaining: DataTypes.INTEGER,
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'completed', 'cancelled'),
      defaultValue: 'active'
    },
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
  });
  return Subscription;
};
