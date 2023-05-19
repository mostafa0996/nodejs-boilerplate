const {
  roles: { ADMIN, CUSTOMER, MODERATOR },
} = require('../../enum/roles');

const adminPolicy = require('./adminPolicy');
const moderatorPolicy = require('./moderatorPolicy');
const customerPolicy = require('./customerPolicy');

const opts = {
  [ADMIN]: adminPolicy,
  [MODERATOR]: moderatorPolicy,
  [CUSTOMER]: customerPolicy,
};

module.exports = opts;
