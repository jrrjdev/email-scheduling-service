'use strict';

const request = require('request');

if (process.env.NODE_ENV == 'production') {
    console.log('NODE_ENV: production');
    var environment = require('../environments/environment.prod');
} else {
    console.log('NODE_ENV: development');
    var environment = require('../environments/environment');
}

module.exports = {
    getScheduledEmailsReadyToSend: function () {
        return new Promise(function (resolve, reject) {
            request({
                url: environment.apiServerDomain + '/private-api/scheduled-emails',
                qs: { apiKey: environment.privateApiKey, filterType: 'readyToSend' }, json: true
            }, function (error, response, body) {
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body);

                if (error != null) {
                    return reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    },
    markScheduledEmailAsSent: function (scheduledEmailId, sentDateTime) {
        return new Promise(function (resolve, reject) {
            request.patch({
                url: environment.apiServerDomain + '/private-api/scheduled-emails/' + scheduledEmailId,
                qs: { apiKey: environment.privateApiKey }, json: true,
                body: {
                    patchType: 'markSent',
                    sentDateTime: sentDateTime
                }
            }, function (error, response, body) {
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body);

                if (error != null) {
                    return reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    }
};
