const {
  OK,
  CREATED,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  NO_CONTENT,
  NOT_FOUND,
} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { Op } = require('sequelize');
const {
  roles: { ADMIN, CUSTOMER, MODERATOR },
} = require('../../../common/enum/roles');
const logger = require('../../../common/config/logger');
const config = require('../../../common/config/configuration');
const EmailService = require('../../../common/services/emailService');
const { PAGE_LIMIT } = require('../../../common/constants');
const { User } = require('../../../common/init/db/init-db');
const ErrorResponse = require('../../../common/utils/errorResponse');
const {
  formatSearchOptions,
  validatePassword,
  toAuthJSON,
  generateJWT,
} = require('../helpers/utils');
const { exportUsersService } = require('../services/index');
// auth controllers
const socialCallback = require('./socialCallback');
const socialLogin = require('./socialLogin');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
      raw: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          'Login failed, No account with this e-mail',
          NOT_FOUND
        )
      );
    }
    const isMatch = await validatePassword(password, user.password);
    if (!isMatch) {
      return next(
        new ErrorResponse(
          'Login Failed, please make sure password is correct!',
          UNAUTHORIZED
        )
      );
    }
    const data = toAuthJSON(user);
    return res.status(OK).json({
      success: true,
      message: 'User logged in successfully',
      data: { user, token: data.token },
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error while login ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, country, role } =
      req.body;
    const payload = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phoneNumber,
      email,
      password,
      country,
    };
    role ? (payload.role = role) : null;
    // Create User
    const user = await User.create(payload);

    const verificationToken = jwt.sign(
      { id: user.id, type: 'Verify' },
      config.jwt.key,
      {
        algorithm: 'HS256',
      }
    );
    const verificationTokenExpiration = Date.now() + Math.abs(3600000 * 4);
    const updatedPayload = {
      verificationToken,
      verificationTokenExpiration,
    };
    await User.update(updatedPayload, { where: { id: user.id } });

    EmailService.sendVerificationEmail(
      verificationToken,
      payload.firstName,
      payload.email
    );

    return res
      .status(CREATED)
      .json({ success: true, message: 'User Created', data: user });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error while signup ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    const selector = {
      verificationToken: token,
      verificationTokenExpiration: { [Op.gte]: new Date() },
    };
    const user = await User.findOne({
      where: selector,
      raw: true,
    });
    if (!user) {
      throw new Error('No valid token found');
    }
    const updatedPayload = {
      verified: true,
      verificationToken: null,
      verificationTokenExpiration: null,
    };
    await User.update(updatedPayload, { where: { id: user.id } });
    return res.status(OK).json({
      success: true,
      message: 'User Verified successfully',
      data: null,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error while verifing user ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      raw: true,
    });
    if (!user) {
      throw new Error('Invalid Email Address');
    }
    const resetPasswordToken = jwt.sign(
      { id: user.id, type: 'Verify' },
      config.jwt.key,
      {
        algorithm: 'HS256',
      }
    );
    const resetPasswordExpiration = Date.now() + Math.abs(3600000 * 4);
    const updatedPayload = {
      resetPasswordToken,
      resetPasswordExpiration,
    };
    await User.update(updatedPayload, { where: { id: user.id } });
    EmailService.sendPasswordResetEmail(
      resetPasswordToken,
      user.firstName,
      user.email
    );
    return res.status(CREATED).json({
      success: true,
      message: 'Password reset token sent successfully',
      data: null,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error creating reset password token ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const salt = await bcrypt.genSalt(+config.salt);
    const selector = {
      resetPasswordToken: token,
      resetPasswordExpiration: { [Op.gte]: new Date() },
    };
    const user = await User.findOne({
      where: selector,
      raw: true,
    });
    if (!user) {
      throw new Error('No valid token found');
    }

    hashedPassword = await bcrypt.hash(password, salt);
    const updatedPayload = {
      resetPasswordToken: null,
      resetPasswordExpiration: null,
      password: hashedPassword,
    };
    await User.update(updatedPayload, { where: { id: user.id } });
    return res.status(OK).json({
      success: true,
      message: 'User Password Reset successfully',
      data: null,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error resetting user password ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = Number(req.query.limit) || PAGE_LIMIT;
    const offset = limit * page - limit;
    delete req.query.page;
    const whereClause = formatSearchOptions(req.query);
    const { rows, count } = await User.findAndCountAll({
      where: whereClause,
      raw: true,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    const users = rows.map((row) => {
      const _id = row.id;
      delete row.id;
      return {
        ...row,
        _id,
      };
    });
    return res.status(OK).json({
      success: true,
      message: 'Users loaded successfully',
      count,
      totalPages: Math.ceil(count / limit),
      data: users,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error get all users ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = req.param.id;
    const user = await User.findOne({
      where: { id },
      raw: true,
    });
    if (!user) {
      return next(new ErrorResponse('User not found', NOT_FOUND));
    }
    return res.status(OK).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error get user', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user.id;
    console.log(loggedInUser);
    const payload = req.body;
    const updatedPayload = { id: userId };
    if (userId == loggedInUser) {
      updatedPayload.firstName = payload.firstName;
      updatedPayload.lastName = payload.lastName;
      updatedPayload.phoneNumber = payload.phoneNumber;
      updatedPayload.fullName = `${payload.firstName} ${payload.lastName}`;
      updatedPayload.photo = payload.photo;
      updatedPayload.country = payload.country;
    } else {
      updatedPayload.firstName = payload.firstName;
      updatedPayload.lastName = payload.lastName;
      updatedPayload.fullName = `${payload.firstName} ${payload.lastName}`;
      updatedPayload.phoneNumber = payload.phoneNumber;
      updatedPayload.country = payload.country;
      updatedPayload.verified = payload.verified;
      updatedPayload.role = payload.role;
      updatedPayload.vip = payload.vip;
    }
    await User.update(updatedPayload, { where: { id: userId } });
    const user = await User.findOne({
      where: { id: userId },
      raw: true,
    });
    return res.status(OK).json({
      success: true,
      message: 'Users updated successfully',
      data: user,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error update user ', errors);
    next(
      new ErrorResponse(
        errors,
        error.status || INTERNAL_SERVER_ERROR,
        error.stack
      )
    );
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.destroy({
      where: { id },
    });
    return res.status(OK).json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error delete user ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const exportUsers = async (req, res, next) => {
  try {
    const result = await exportUsersService();
    const fileName = moment(new Date()).format('DD-MM-YYYY');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `${'attachment; filename=Users_'}${fileName}.xlsx"`
    );
    return res.status(OK).send(result);
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error delete user ', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const sendHireDeveloperEmail = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await User.findOne({
      where: { id },
      raw: true,
    });
    if (!user) {
      return next(new ErrorResponse('User not found', NOT_FOUND));
    }
    const email = user.email;
    const { description } = req.body;
    EmailService.sendHireDeveloperEmail(email, description, user);
    return res.status(OK).json({
      success: true,
      message: 'Email sent successfully',
      data: null,
    });
  } catch (error) {
    const errors = error.errors
      ? error.errors.map((e) => e.message)
      : error.message;
    logger.error('Error get user', errors);
    next(new ErrorResponse(errors, error.status || INTERNAL_SERVER_ERROR));
  }
};

const sendContactUsEmail = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    EmailService.sendContactUsEmail(email, message, firstName, lastName);
    return res.status(OK).json({
      success: true,
      message: 'Email sent successfully',
      data: null,
    });
  } catch (error) {
    logger.error('Error get user', error.message);
    next(
      new ErrorResponse(error.message, error.status || INTERNAL_SERVER_ERROR)
    );
  }
};

module.exports = {
  login,
  signUp,
  socialCallback,
  socialLogin,
  verifyUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  exportUsers,
  sendHireDeveloperEmail,
  sendContactUsEmail,
};
