const logger = require("../../../common/config/logger");
const sgMail = require("@sendgrid/mail");
const config = require("../../config/configuration");
sgMail.setApiKey(config.sendgrid.apikey);

const _sendEmail = async (email, subject, text) => {
  const msg = {
    to: email,
    from: "hello@gmail.com",
    subject: subject,
    text: text,
  };

  sgMail.send(msg).then(
    (result) => {
      logger.info(JSON.stringify(result, null, 2));
    },
    (error) => {
      if (error.response) {
        logger.error(JSON.stringify(error.response.body));
        throw new Error(JSON.stringify(error.response.body));
      }
    }
  );
};

const _sendHtmlEmail = async (email, subject, html) => {
  const msg = {
    to: email,
    from: "hello@gmail.com",
    subject: subject,
    html,
  };

  sgMail.send(msg).then(
    (result) => {
      logger.info(JSON.stringify(result, null, 2));
    },
    (error) => {
      if (error.response) {
        logger.error(JSON.stringify(error.response.body));
        throw new Error(JSON.stringify(error.response.body));
      }
    }
  );
};

const sendVerificationEmail = async (token, name, email) => {
  const subject = "The Project Verification";
  const verificationLink = `http://localhost:3000/home/Verification/${token}`;
  const html = require("./templates/verifyEmail")(verificationLink);
  return _sendHtmlEmail(email, subject, html);
};

const sendPasswordResetEmail = async (token, name, email) => {
  const subject = "The Project Password Reset";
  const resetLink = `http://localhost:3000/home/NewPassword/${token}`;
  const html = require("./templates/resetPassword")(resetLink, name);
  return _sendHtmlEmail(email, subject, html);
};

const sendHireDeveloperEmail = async (fromEmail, body, user) => {
  const { firstName, lastName, country } = user;
  const subject = "Hire a developer request";
  const text = `
  First Name: ${firstName},
  Last Name: ${lastName},
  Country: ${country},
  Email: ${fromEmail},
  Message: 
  ${body}
  `;
  return _sendEmail("hire@xx.com", subject, text);
};

const sendContactUsEmail = async (fromEmail, body, firstName, lastName) => {
  const subject = `Contact us email from ${firstName} ${lastName}`;
  const text = `Thi request is from ${fromEmail}.
  ${body}
  `;
  return _sendEmail("contact-us@xx.com", subject, text);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendHireDeveloperEmail,
  sendContactUsEmail,
};
