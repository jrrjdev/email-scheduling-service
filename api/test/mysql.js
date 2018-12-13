'use strict';

const assert = require('assert');
const moment = require('moment');

const mysqlConnectionPool = require('../mysql/connection-pool').connectionPool;
const emailSchedule = require('../mysql/db/email-schedule');
const ScheduledEmail = require('../lib/scheduled-email');

describe('mysql', function () {
    describe('connection-pool', function () {
        it('should return a valid connection pool', function (done) {
            mysqlConnectionPool.getConnection(function (err, connection) {
                if (err) done(err);
                else done();
            });
        });
    });

    describe('email-schedule', function () {
        let newScheduledEmail = new ScheduledEmail(moment('2018-01-01 13:00:00').utc(), 'test@test.com', 'test subject', 'test text');

        it('should insert an email schedule into table EmailSchedule', function (done) {
            mysqlConnectionPool.getConnection(async function (err, connection) {
                if (err) done(err);
                else {
                    let insertResult = await emailSchedule.insertEmailSchedule(connection, newScheduledEmail);
                    let scheduledEmailInDB = (await emailSchedule.selectScheduledEmailById(connection, insertResult.insertId))[0];

                    assert.equal(insertResult.affectedRows, 1);
                    assert.equal(scheduledEmailInDB.Id, insertResult.insertId);
                    assert.equal(moment(scheduledEmailInDB.ScheduledDateTime).utc().toISOString(), newScheduledEmail.scheduledDateTime.toISOString());
                    assert.equal(scheduledEmailInDB.ToEmailAddress, newScheduledEmail.toEmailAddress);
                    assert.equal(scheduledEmailInDB.Subject, newScheduledEmail.subject);
                    assert.equal(scheduledEmailInDB.Text, newScheduledEmail.text);

                    done();
                }
            });
        });

        it('should return an array of scheduled email which are ready to send', function (done) {
            mysqlConnectionPool.getConnection(async function (err, connection) {
                if (err) done(err);
                else {
                    let result = await emailSchedule.selectScheduledEmailsReadyToSend(connection);
                    assert.equal(Array.isArray(result), true);
                    done();
                }
            });
        });

        it('should update the scheduled email as sent', function (done) {
            mysqlConnectionPool.getConnection(async function (err, connection) {
                if (err) done(err);
                else {
                    let insertResult = await emailSchedule.insertEmailSchedule(connection, newScheduledEmail);
                    let scheduledEmailInDB = (await emailSchedule.selectScheduledEmailById(connection, insertResult.insertId))[0];

                    assert.equal(scheduledEmailInDB.Sent, 0);

                    let now = new Date();
                    now.setMilliseconds(0); // MySQL datetime type does not support milliseconds
                    let nowMoment = moment(now).utc();
                    let updateResult = await emailSchedule.updateScheduledEmailAsSentById(connection, scheduledEmailInDB.Id, nowMoment);

                    let updatedScheduledEmailInDB = (await emailSchedule.selectScheduledEmailById(connection, insertResult.insertId))[0];
                    assert.equal(updatedScheduledEmailInDB.Sent, 1);
                    assert.equal(updatedScheduledEmailInDB.SentDateTime.toISOString(), now.toISOString());

                    done();
                }
            });
        });
    });
});
