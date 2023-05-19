const { roles } = require('../../../common/enum/roles');
const bcrypt = require('bcryptjs');
const config = require('../../../common/config/configuration');

module.exports = (sequelize, DataType) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataType.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataType.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataType.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataType.STRING,
        allowNull: true,
      },
      googleId: {
        type: DataType.STRING,
        allowNull: true,
      },
      facebookId: {
        type: DataType.STRING,
        allowNull: true,
      },
      email: {
        type: DataType.STRING,
        unique: true,
        allowNull: false,
      },
      role: {
        type: DataType.INTEGER,
        enum: Object.values(roles),
        defaultValue: roles.CUSTOMER,
      },
      password: {
        type: DataType.STRING,
        get() {
          return () => this.getDataValue('password');
        },
      },
      salt: {
        type: DataType.STRING,
        get() {
          return () => this.getDataValue('salt');
        },
      },
      verified: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataType.STRING,
      },
      verificationTokenExpiration: {
        type: DataType.DATE,
      },
      resetPasswordToken: {
        type: DataType.STRING,
      },
      resetPasswordExpiration: {
        type: DataType.DATE,
      },
      photo: {
        type: DataType.TEXT('long'),
      },
      country: {
        type: DataType.STRING,
      },
      vip: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      hooks: {
        beforeCreate: async function (user) {
          const data = user.dataValues;
          if (user.changed('password')) {
            data.salt = await bcrypt.genSalt(+config.salt);
            data.password = await bcrypt.hash(data.password, data.salt);
          }
        },
        beforeUpdate: async function (user) {
          const data = user.dataValues;
          if (user.changed('password')) {
            data.salt = await bcrypt.genSalt(+config.salt);
            data.password = await bcrypt.hash(data.password, data.salt);
          }
        },
      },
    }
  );
  return User;
};
