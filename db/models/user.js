'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
        User.hasMany(models.Notification, {
            foreignKey: 'user_id',
            as: 'notifications'
        });
        User.hasMany(models.Payment, {
            foreignKey: 'user_id',
            as: 'payments'
        });
        User.hasOne(models.Subscription, {
            foreignKey: 'user_id',
            as: 'subscription'
        });
        User.hasOne(models.OTP, {
            foreignKey: 'user_id',
            as: 'otp'
        });
    }
  }
  User.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: DataTypes.STRING,
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // profile_picture:  {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};
