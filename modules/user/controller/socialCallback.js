const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const passport = require('passport');

const ErrorResponse = require('../../../common/utils/errorResponse');

module.exports = (strategy, scope) => {
  return (req, res, next) => {
    passport.authenticate(
      `${strategy}`,
      {
        session: false,
        scope
      },
      (err, user) => {
        if (err) {
          return next(
            new ErrorResponse(
              err.message,
              err.status || INTERNAL_SERVER_ERROR,
              JSON.stringify(err.stack)
            )
          );
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  };
};
