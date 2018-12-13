'use strict';

module.exports = class ScheduledEmail {
    constructor(scheduledDateTime, toEmailAddress, subject, text) {
        this.scheduledDateTime = scheduledDateTime;
        this.toEmailAddress = toEmailAddress;
        this.subject = subject;
        this.text = text;
    };
};
