'use strict';

var chai = require('chai');
const chaiHttp = require('chai-http');
const moment = require('moment');

const server = require('../server');
const ScheduledEmail = require('../lib/scheduled-email');
var environment = require('../environments/environment');

const should = chai.should();

chai.use(chaiHttp);

describe('routes', function () {
    describe('/api', function () {
        it('should add a scheduled email', function (done) {
            let newScheduledEmail = new ScheduledEmail(moment('2018-01-01 13:00:00').utc(), 'test@test.com', 'test subject', 'api/scheduled-emails');

            chai.request(server)
                .post('/api/scheduled-emails')
                .send(newScheduledEmail)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('scheduledEmail');
                    res.body.data.scheduledEmail.should.be.a('object');
                    res.body.data.scheduledEmail.ScheduledDateTime.should.be.eql(newScheduledEmail.scheduledDateTime.toISOString());
                    res.body.data.scheduledEmail.ToEmailAddress.should.be.eql(newScheduledEmail.toEmailAddress);
                    res.body.data.scheduledEmail.Subject.should.be.eql(newScheduledEmail.subject);
                    res.body.data.scheduledEmail.Text.should.be.eql(newScheduledEmail.text);

                    done();
                });
        });
    });

    describe('/private-api', function (done) {
        it('should get an array of scheduled emails which are ready to send', function (done) {
            chai.request(server)
                .get('/private-api/scheduled-emails')
                .query({ filterType: 'readyToSend', apiKey: environment.privateApiKey })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('items');
                    res.body.data.items.should.be.a('array');

                    done();
                });
        });

        it('should update the scheduled email as sent', function (done) {
            let newScheduledEmail = new ScheduledEmail(moment('2018-01-01 13:00:00').utc(), 'test@test.com', 'test subject', 'private-api/scheduled-emails');

            chai.request(server)
                .post('/api/scheduled-emails')
                .send(newScheduledEmail)
                .end((err, res) => {
                    res.body.data.scheduledEmail.Id.should.be.a('number');

                    chai.request(server)
                        .patch('/private-api/scheduled-emails/' + res.body.data.scheduledEmail.Id)
                        .query({ apiKey: environment.privateApiKey })
                        .send({ patchType: 'markSent', sentDateTime: new Date() })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('data');
                            res.body.data.should.have.property('message');
                            res.body.data.message.should.be.eql('updated');

                            done();
                        });
                });
        });
    });
});
