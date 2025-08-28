'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
       Payment.belongsTo(models.Subscription, {
        foreignKey: 'subscription_id',
        as: 'subscription'
      });
    }
  }
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: DataTypes.UUID,
    subscription_id: DataTypes.UUID,
    payment_date: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('success', 'pending', 'failed'),
      defaultValue: 'pending'
    },
    order_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments'
  });
  return Payment;
};
