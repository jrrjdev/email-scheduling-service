'use strict';

const request = require('request');

const EmailServices = require('./lib/email-api-services');
const ScheduledEmail = require('./lib/scheduled-email');
const restApi = require('./lib/rest-api');

if (process.env.NODE_ENV == 'production') {
    console.log('NODE_ENV: production');
    var environment = require('./environments/environment.prod');
} else {
    console.log('NODE_ENV: development');
    var environment = require('./environments/environment');
}

const loopCoolDown = 1000; //1000ms

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while (true) {
        try {
            let scheduledEmailsJson = await restApi.getScheduledEmailsReadyToSend();

            if (scheduledEmailsJson.data != null) {
                let scheduledEmailsData = scheduledEmailsJson.data.items;
                console.log('Scheduled emails ready to sent count: ' + scheduledEmailsData.length + ' (' + (new Date()).toLocaleString() + ')');

                for (let scheduledEmailData of scheduledEmailsData) {
                    try {
                        let scheduledEmail = new ScheduledEmail(scheduledEmailData.ScheduledDateTime, scheduledEmailData.ToEmailAddress, scheduledEmailData.Subject, scheduledEmailData.Text);

                        let sendEmailResult = await EmailServices.sendEmail(scheduledEmail);
                        if (sendEmailResult) {
                            console.log('Sent scheduled email id: ' + scheduledEmailData.Id);

                            let sentDateTime = new Date();
                            restApi.markScheduledEmailAsSent(scheduledEmailData.Id, sentDateTime);
                        }
                    }
                    catch (error) {
                        console.error('Fail to send scheduled email id: ' + scheduledEmailData.Id);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            await sleep(loopCoolDown);
        }
    }
}

main();
