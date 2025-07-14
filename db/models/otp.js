'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    static associate(models) {
      // OTP dimiliki oleh seorang User
      OTP.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  OTP.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: DataTypes.UUID,
    verification_code: DataTypes.STRING,
    verification_code_expires_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'OTP',
    tableName: 'otps',
  });
  return OTP;
};
