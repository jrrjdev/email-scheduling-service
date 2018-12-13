export class ScheduledEmail {
    id: number;
    sent: boolean;
    scheduledDateTime: Date;
    scheduledDateTimeString: string;
    toEmailAddress: string;
    subject: string;
    text: string;
    sentDateTime: Date;

    constructor(
        id: number,
        sent: boolean,
        scheduledDateTime: Date,
        scheduledDateTimeString: string,
        toEmailAddress: string,
        subject: string,
        text: string,
        sentDateTime: Date
    ) {
        this.id = id;
        this.sent = sent;
        this.scheduledDateTime = scheduledDateTime;
        this.scheduledDateTimeString = scheduledDateTimeString;
        this.toEmailAddress = toEmailAddress;
        this.subject = subject;
        this.text = text;
        this.sentDateTime = sentDateTime;
    }
}
