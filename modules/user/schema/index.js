const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');

const config = require('../../../common/config/configuration');
const { roles } = require('../../../common/enum/roles');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      select: false,
    },
    facebookId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      select: false,
    },
    email: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid Mail',
      ],
      required: true,
    },
    role: {
      type: Number,
      enum: Object.values(roles),
      default: roles.CUSTOMER,
    },
    password: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiration: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiration: {
      type: Date,
    },
    photo: { type: String, default: 'no-photo.jpg' },
    country: {
      type: String,
    },
    vip: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'users',
    timestamps: true,
    versionKey: false,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (this.password) {
    if (this.isNew) {
      this.email = this.email.toLowerCase();
    }
    if (!this.isModified('password')) {
      next();
    }
    const salt = await bcrypt.genSalt(+config.salt);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } else next();
});

// Sign jwt
UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { _id: this._id, role: this.role, verified: this.verified },
    config.jwt.key,
    {
      algorithm: 'HS256',
      expiresIn: config.jwt.expire,
    }
  );
};

UserSchema.methods.toAuthJSON = function () {
  const token = this.generateJWT();
  return {
    _id: this._id,
    role: this.role,
    verified: this.verified,
    token: `Bearer ${token}`,
  };
};

// Match user hashed password with entered password
UserSchema.methods.validatePassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

UserSchema.plugin(uniqueValidator, {
  message: 'Error, expected {PATH} to be unique.',
});

const User = mongoose.model('users', UserSchema);

module.exports = User;
