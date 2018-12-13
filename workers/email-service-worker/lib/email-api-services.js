'use strict';

const mailgun = require('./email-service-providers/mailgun');
const sendgrid = require('./email-service-providers/sendgrid');

module.exports = class EmailApiServices {
    static sendEmail(scheduledEmail) {
        return new Promise(async function (resolve, reject) {
            try {
                let mailgunSendEmailResult = await mailgun.sendEmail(scheduledEmail);
                resolve(true);
            }
            catch (error) {
                try {
                    let sendgridSendEmailResult = await sendgrid.sendEmail(scheduledEmail);
                    resolve(true);
                }
                catch (error) {
                    return reject(error);
                }
            }
        });
    }
};
