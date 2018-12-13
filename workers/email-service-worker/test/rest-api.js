'use strict';

var chai = require('chai');
const should = chai.should();

const restApi = require('../lib/rest-api');

describe('rest-api', function () {
    it('should get an array of scheduled emails which are ready to send', async function () {
        let scheduledEmailsJson = await restApi.getScheduledEmailsReadyToSend();
        scheduledEmailsJson.should.have.property('data');
        scheduledEmailsJson.data.should.have.property('items');
        scheduledEmailsJson.data.items.should.be.a('array');
    });

    it('should update the scheduled email as sent', async function () {
        let updateJson = await restApi.markScheduledEmailAsSent(1, new Date());
        updateJson.should.have.property('data');
        updateJson.data.should.have.property('message');
        updateJson.data.message.should.be.eql('updated');
    });
});
