'use strict';

if (process.env.NODE_ENV == 'production') {
  var environment = require('../../environments/environment.prod');
} else {
  var environment = require('../../environments/environment');
}

const sgMail = require('@sendgrid/mail');

const sgApiKey = environment.sendgridApiKey;

sgMail.setApiKey(sgApiKey);

module.exports = {
  sendEmail: function (scheduledEmail) {
    if (!scheduledEmail.text) {
      scheduledEmail.text = ' '; // third-party email services require non-empty text
    }

    return new Promise(function (resolve, reject) {
      const msg = {
        from: environment.sendgridSendingEmailAddress,
        to: scheduledEmail.toEmailAddress,
        subject: scheduledEmail.subject,
        text: scheduledEmail.text,
      };

      sgMail
        .send(msg)
        .then(() => {
          //Celebrate
          resolve(true);
        })
        .catch(error => {

          //Log friendly error
          console.error('Sendgrid: ' + error.toString());

          //Extract error msg
          const { message, code, response } = error;

          //Extract response msg
          const { headers, body } = response;

          return reject(error);
        });
    });
  }
};
