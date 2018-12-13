const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const mysqlConnectionPool = require('../mysql/connection-pool').connectionPool;
const emailSchedule = require('../mysql/db/email-schedule');
const ScheduledEmail = require('../lib/scheduled-email');

var router = express.Router();

// create application/json parser
var jsonParser = bodyParser.json();

if (process.env.NODE_ENV == 'production') {
    var environment = require('../environments/environment.prod');
} else {
    var environment = require('../environments/environment');
}

function checkScheduledEmailData(scheduledEmail, res) {
    if (!scheduledEmail.scheduledDateTime.isValid()) {
        res.status(400).json({ error: { message: 'invalid scheduledDateTime' } });
        return false;
    }

    if (!scheduledEmail.toEmailAddress || scheduledEmail.toEmailAddress.length == 0) {
        res.status(400).json({ error: { message: 'invalid toEmailAddress' } });
        return false;
    }

    if (!scheduledEmail.subject || scheduledEmail.subject.length == 0) {
        res.status(400).json({ error: { message: 'invalid subject' } });
        return false;
    }

    // if (!scheduledEmail.text || scheduledEmail.text.length == 0) {
    //     res.status(400).json({ error: { message: 'empty text' } });
    //     return false;
    // }

    return true;
}

async function addEmailSchedule(conn, scheduledEmail, res) {
    try {
        let insertResult = await emailSchedule.insertEmailSchedule(conn, scheduledEmail);

        let scheduledEmailInDB = (await emailSchedule.selectScheduledEmailById(conn, insertResult.insertId))[0];

        if (insertResult.affectedRows == 1) {
            res.json({ data: { scheduledEmail: scheduledEmailInDB } });
        } else {
            res.status(400).json({ error: { message: 'not inserted' } });
        }

        conn.release();
    } catch (error) {
        res.status(500).json({ error: { message: 'Please try again.' } });
        conn.release();
    }
}

router.post('/', jsonParser, function (req, res) {
    mysqlConnectionPool.getConnection(function (err, connection) {
        let scheduledEmail = new ScheduledEmail(moment(req.body.scheduledDateTime).utc(), req.body.toEmailAddress, req.body.subject, req.body.text);
        if (checkScheduledEmailData(scheduledEmail, res)) {
            addEmailSchedule(connection, scheduledEmail, res);
        } else {
            connection.release();
        }
    });
});

module.exports = router;
