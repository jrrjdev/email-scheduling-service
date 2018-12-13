import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import * as moment from 'moment';

import { ApiResponse } from './services/api-response';
import { EmailScheduleService } from './services/email-schedule.service';
import { ScheduledEmail } from './services/scheduled-email';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Schedule an email';

  timezoneOffsetSign: string;
  timezoneOffset: number;

  scheduledDateTime: string;
  toEmailAddress: string;
  emailSubject: string;
  emailText: string;

  scheduledDateTimeInputErrorMessage: string;
  toEmailAddressInputErrorMessage: string;
  emailSubjectInputErrorMessage: string;
  emailTextInputErrorMessage: string;

  submitButtonText: string;

  submitting: boolean;

  submitResponseMessage: string;

  submitSuccess: boolean;

  constructor(
    private emailScheduleService: EmailScheduleService
  ) {
    this.checkTimezone();

    this.emailText = '';
    this.submitButtonText = 'Submit';
    this.submitting = false;
  }

  ngOnInit() {
  }

  checkTimezone() {
    this.timezoneOffset = new Date().getTimezoneOffset() / -60;
    if (this.timezoneOffset >= 0) {
      this.timezoneOffsetSign = '+';
    } else {
      this.timezoneOffsetSign = '-';
    }
  }

  validateEmail(email: string) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  checkInput() {
    this.scheduledDateTimeInputErrorMessage = '';
    this.toEmailAddressInputErrorMessage = '';
    this.emailSubjectInputErrorMessage = '';
    this.emailTextInputErrorMessage = '';

    if (!this.scheduledDateTime) {
      this.scheduledDateTimeInputErrorMessage = 'invalid time';
      return false;
    }

    if (!this.toEmailAddress || !this.validateEmail(this.toEmailAddress)) {
      this.toEmailAddressInputErrorMessage = 'invalid email address';
      return false;
    }

    if (!this.emailSubject) {
      this.emailSubjectInputErrorMessage = 'enter a subject';
      return false;
    }

    // if (!this.emailText) {
    //   this.emailTextInputErrorMessage = 'enter some text';
    //   return false;
    // }

    return true;
  }

  onSubmit() {
    console.log(this.scheduledDateTime + ' ' + this.toEmailAddress + ' ' + this.emailSubject + ' ' + this.emailText);
    console.log(moment(this.scheduledDateTime).toISOString());

    this.submitting = true;
    this.submitButtonText = 'checking input...';
    this.submitResponseMessage = '';

    if (this.checkInput()) {
      this.submitButtonText = 'submitting...';

      this.emailScheduleService.addScheduledEmail(
          // tslint:disable-next-line:max-line-length
          new ScheduledEmail(null, false, null, moment(this.scheduledDateTime).toISOString(), this.toEmailAddress, this.emailSubject, this.emailText, null)
        )
          .subscribe(res => {
            console.log(res);

            this.submitResponseMessage = JSON.stringify(res);
            this.submitSuccess = true;

            this.submitting = false;
            this.submitButtonText = 'Submit';

            const apiResponse = new ApiResponse(res);

            if (apiResponse.data != null) {
            } else {
              if (apiResponse.error != null) {

              } else {

              }
            }

          },
          err => {
            console.error(err);

            this.submitResponseMessage = JSON.stringify(err.error);
            this.submitSuccess = false;

            this.submitting = false;
            this.submitButtonText = 'Submit';
          });
    } else {
      this.submitting = false;
      this.submitButtonText = 'Submit';
    }

  }

}
