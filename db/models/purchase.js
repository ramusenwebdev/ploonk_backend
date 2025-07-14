'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      // Purchase dimiliki oleh seorang User
      Purchase.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      // Purchase merujuk ke sebuah Package
      Purchase.belongsTo(models.Package, {
        foreignKey: 'package_id',
        as: 'package'
      });
    }
  }
  Purchase.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: DataTypes.UUID,
    package_id: DataTypes.UUID,
    purchase_date: DataTypes.DATE,
    sessions_remaining: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('active', 'expired', 'completed'),
      defaultValue: 'active'
    },
    order_id: DataTypes.STRING,
    payment_gateway: DataTypes.STRING,
    payment_status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases'
  });
  return Purchase;
};
