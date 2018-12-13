const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const mysqlConnectionPool = require('../../mysql/connection-pool').connectionPool;
const emailSchedule = require('../../mysql/db/email-schedule');
const ScheduledEmail = require('../../lib/scheduled-email');

var router = express.Router();

// create application/json parser
var jsonParser = bodyParser.json();

if (process.env.NODE_ENV == 'production') {
    var environment = require('../../environments/environment.prod');
} else {
    var environment = require('../../environments/environment');
}

function checkScheduledEmailsGetQuery(query, res) {
    if (!query.filterType) {
        res.status(400).json({ error: { message: 'missing filterType' } });
        return false;
    } else {
        if (query.filterType == 'readyToSend') {
        } else {
            res.status(400).json({ error: { message: 'invalid filterType' } });
            return false;
        }
    }

    return true;
}

async function getScheduledEmailsReadyToSend(conn, res) {
    try {
        let result = await emailSchedule.selectScheduledEmailsReadyToSend(conn);

        res.json({ data: { items: result } });

        conn.release();
    } catch (error) {
        res.status(500).json({ error: { message: 'Please try again.' } });
        conn.release();
    }
}

router.get('/', function (req, res) {
    mysqlConnectionPool.getConnection(function (err, connection) {
        if (checkScheduledEmailsGetQuery(req.query, res)) {
            let filterType = req.query.filterType;
            if (filterType == 'readyToSend') {
                getScheduledEmailsReadyToSend(connection, res);
            }
        } else {
            connection.release();
        }
    });
});

function checkScheduledEmailPatchBody(body, res) {
    if (!body.patchType) {
        res.status(400).json({ error: { message: 'missing patchType' } });
        return false;
    } else {
        if (body.patchType == 'markSent') {
            if (!body.sentDateTime || body.sentDateTime == '') {
                res.status(400).json({ error: { message: 'invalid sentDateTime' } });
                return false;
            }
        } else {
            res.status(400).json({ error: { message: 'invalid patchType' } });
            return false;
        }
    }

    return true;
}

async function markScheduledEmailAsSentById(conn, scheduledEmailId, sentDateTime, res) {
    try {
        let updateResult = await emailSchedule.updateScheduledEmailAsSentById(conn, scheduledEmailId, sentDateTime);

        if (updateResult.affectedRows == 1) {
            res.json({ data: { message: 'updated' } });
        } else {
            res.status(400).json({ error: { message: 'not updated' } });
        }

        conn.release();
    } catch (error) {
        res.status(500).json({ error: { message: 'Please try again.' } });
        conn.release();
    }
}

router.patch('/:scheduledEmailId', jsonParser, function (req, res) {
    mysqlConnectionPool.getConnection(function (err, connection) {
        if (checkScheduledEmailPatchBody(req.body, res)) {
            let patchType = req.body.patchType;
            if (patchType == 'markSent') {
                let sentDateTime = moment(req.body.sentDateTime).utc();
                markScheduledEmailAsSentById(connection, req.params.scheduledEmailId, sentDateTime, res);
            }
        } else {
            connection.release();
        }
    });
});

module.exports = router;
