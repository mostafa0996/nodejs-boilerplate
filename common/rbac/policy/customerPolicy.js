const {
  USER_GET_USER,
  USER_HIRE_DEVELOPER,
  USER_UPDATE_USER,
} = require("./endpoints");

module.exports = {
  can: [USER_GET_USER, USER_HIRE_DEVELOPER, USER_UPDATE_USER],
};
