const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const config = require('../../../common/config/configuration');

class Utils {
  static formatSearchOptions = (query) => {
    const formattedQuery = {};
    if (query.text && query.text != '') {
      formattedQuery[Op.or] = [
        {
          firstName: { [Op.like]: `%${query.text}%` },
        },
        {
          lastName: { [Op.like]: `%${query.text}%` },
        },
        {
          phoneNumber: { [Op.like]: `%${query.text}%` },
        },
        {
          email: { [Op.like]: `%${query.text}%` },
        },
        {
          country: { [Op.like]: `%${query.text}%` },
        },
      ];
    }
    return formattedQuery;
  };

  static validatePassword = (enteredPassword, password) => {
    return bcrypt.compare(enteredPassword, password);
  };

  static generateJWT = (id, role, verified) => {
    return jwt.sign({ id, role, verified }, config.jwt.key, {
      algorithm: 'HS256',
      expiresIn: config.jwt.expire,
    });
  };

  static toAuthJSON = (user) => {
    const { id, role, verified } = user;
    const token = this.generateJWT(id, role, verified);
    return {
      id,
      role,
      verified,
      token: `Bearer ${token}`,
    };
  };
}

module.exports = Utils;
