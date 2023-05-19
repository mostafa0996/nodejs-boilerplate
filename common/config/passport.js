/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const config = require('./configuration');
const { User } = require('../init/db/init-db');

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.key,
  algorithms: ['HS256'],
};

passport.use(
  'jwt',
  new JwtStrategy(jwtOpts, async (payload, done) => {
    try {
      const user = await User.findOne({
        where: { id: payload.id },
        raw: true,
      });
      if (user) {
        return done(null, user);
      }
      done(null, false);
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: [
        'id',
        'photos',
        'displayName',
        'email',
        'first_name',
        'last_name',
        'link',
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json.email || profile.emails[0].value;
        const { id: facebookId, displayName: fullName, photos } = profile;
        const {
          first_name: firstName,
          last_name: lastName,
          picture,
        } = profile._json;
        let photo = picture.data.url;
        if (!photo) {
          photo = photos.length ? photos[0].value : null;
        }
        let user = await User.findOne({
          where: { facebookId },
          raw: true,
        });
        if (!user) {
          user = await User.create({
            facebookId,
            fullName: fullName || `${firstName} ${lastName}`,
            email,
            photo,
            firstName,
            lastName,
            verified: true,
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value || profile._json.email;
        const { id: googleId, displayName: fullName, photos } = profile;
        const {
          given_name: firstName,
          family_name: lastName,
          picture,
          email_verified: verified,
        } = profile._json;
        let photo = picture;
        if (!photo) {
          photo = photos.length ? photos[0].value : null;
        }
        let user = await User.findOne({
          where: { googleId },
          raw: true,
        });
        if (!user) {
          user = await User.create({
            googleId,
            fullName: fullName || `${firstName} ${lastName}`,
            email,
            firstName,
            lastName,
            verified,
            photo,
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
