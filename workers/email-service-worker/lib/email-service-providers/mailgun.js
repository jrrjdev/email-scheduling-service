'use strict';

if (process.env.NODE_ENV == 'production') {
  var environment = require('../../environments/environment.prod');
} else {
  var environment = require('../../environments/environment');
}

const api_key = environment.mailgunApiKey;
const DOMAIN = environment.mailgunDomain;
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: DOMAIN });

module.exports = {
  sendEmail: function (scheduledEmail) {
    if (!scheduledEmail.text) {
      scheduledEmail.text = ' '; // third-party email services require non-empty text
    }

    return new Promise(function (resolve, reject) {
      let data = {
        from: environment.mailgunSendingEmailAddress,
        to: scheduledEmail.toEmailAddress,
        subject: scheduledEmail.subject,
        text: scheduledEmail.text
      };

      mailgun.messages().send(data, function (error, body) {
        if (error != null) {
          console.error('Mailgun: ' + error.toString());
          return reject(error);
        } else {
          resolve(true);
        }
      });
    });
  },
};
