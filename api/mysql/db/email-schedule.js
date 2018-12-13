'use strict';

module.exports = {
    insertEmailSchedule: function (conn, scheduledEmail) {
        return new Promise(function (resolve, reject) {
            let now = new Date();
            let scheduledDateTime = scheduledEmail.scheduledDateTime.format('YYYY-MM-DD HH:mm:ss');

            conn.query('INSERT INTO EmailSchedule SET sent = ?, scheduledDateTime = ?, toEmailAddress = ?, subject = ?, text = ?, createdDateTime = ?', [false, scheduledDateTime, scheduledEmail.toEmailAddress, scheduledEmail.subject, scheduledEmail.text, now], function (error, results, fields) {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    selectScheduledEmailById: function (conn, scheduledEmailId) {
        return new Promise(function (resolve, reject) {
            conn.query('SELECT Id, Sent, ScheduledDateTime, ToEmailAddress, Subject, Text, SentDateTime, CreatedDateTime FROM EmailSchedule WHERE id = ? LIMIT 1', [scheduledEmailId], function (error, results, fields) {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    selectScheduledEmailsReadyToSend: function (conn) {
        return new Promise(function (resolve, reject) {
            let now = new Date();

            conn.query('SELECT Id, ScheduledDateTime, ToEmailAddress, Subject, Text, CreatedDateTime FROM EmailSchedule WHERE sent = ? AND ? >= scheduledDateTime ORDER BY scheduledDateTime ASC LIMIT 1000', [false, now], function (error, results, fields) {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    updateScheduledEmailAsSentById: function (conn, id, sentDateTime) {
        return new Promise(function (resolve, reject) {
            let formattedScheduledDateTime = sentDateTime.format('YYYY-MM-DD HH:mm:ss');

            conn.query('UPDATE EmailSchedule SET sent = ?, sentDateTime = ? WHERE id = ? LIMIT 1', [true, formattedScheduledDateTime, id], function (error, results, fields) {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
}
