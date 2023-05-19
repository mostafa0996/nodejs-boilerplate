require('dotenv').config();

const config = {
    port: parseInt(process.env.PORT, 0) || 3000,
    mongoURI: process.env.MONGODB_URI,
    hostname: process.env.HOSTNAME,
    jwt: {
      key: process.env.JWT_SECRET,
      expire: process.env.JWT_EXPIRE
    },
    baseUrl: process.env.BASE_API_URL,
    salt: process.env.BCRYPT_SALT_ROUNDS,
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      fubsBucketName: process.env.BUCKET
    },
    sendgrid: {
      apikey: process.env.SENDGRID_API_KEY,
    },
    sms: {
      accountSId: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      serviceId: process.env.TWILIO_SERVICE_ID
    },
    payment: {
      integrationId: process.env.ACCEPT_INTEGRATION_ID,
      hmac: process.env.ACCEPT_HMAC,
      apiKey: process.env.ACCEPT_API_KEY,
      username: process.env.ACCEPT_USER_NAME,
      password: process.env.ACCEPT_PASSWORD
    }
};

module.exports = config;