'use strict';

const assert = require('assert');

const mailgun = require('../lib/email-service-providers/mailgun');
const sendgrid = require('../lib/email-service-providers/sendgrid');
const EmailApiServices = require('../lib/email-api-services');
const ScheduledEmail = require('../lib/scheduled-email');

describe('email-api-services', function () {
    let scheduledEmail = new ScheduledEmail(null, 'jrrjdev@gmail.com', 'email-service-worker test', '');

    describe('mailgun', function () {
        it('should send a email via mailgun', async function () {
            this.timeout(5000); // extends timeout to 5 seconds

            let mailgunSendEmailResult = await mailgun.sendEmail(scheduledEmail);
            assert.equal(mailgunSendEmailResult, true);
        });
    });

    describe('sendgrid', function () {
        it('should send a email via sendgrid', async function () {
            this.timeout(5000); // extends timeout to 5 seconds

            let sendgridSendEmailResult = await sendgrid.sendEmail(scheduledEmail);
            assert.equal(sendgridSendEmailResult, true);
        });
    });

    describe('abstraction between two different email service providers', function () {
        it('should failover to a different provider if the default provider goes down', async function () {
            let sendEmailResult = await EmailApiServices.sendEmail(scheduledEmail);
            assert.equal(sendEmailResult, true);
        });
    });;
});
