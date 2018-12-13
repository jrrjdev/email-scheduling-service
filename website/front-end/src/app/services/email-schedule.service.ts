import { Injectable } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { ScheduledEmail } from '../services/scheduled-email';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class EmailScheduleService {

  private emailScheduleUrl = environment.apiServerUrl + '/scheduled-emails';  // URL to web api

  constructor(private http: HttpClient) { }

  addScheduledEmail(scheduledEmail: ScheduledEmail): Observable<any> {
    // const scheduledDateTimeUTC = (new DatePipe('en-US')).transform(scheduledEmail.scheduledDateTime, 'yyyy-MM-ddTHH:mm:ssZ', '+0000');

    return this.http.post<any>(this.emailScheduleUrl,
      {
        scheduledDateTime: scheduledEmail.scheduledDateTimeString,
        toEmailAddress: scheduledEmail.toEmailAddress,
        subject: scheduledEmail.subject,
        text: scheduledEmail.text
      }
      , httpOptions)
      .pipe(
        // tap(_ => this.log(`add scheduled email`)),
        // catchError(this.handleError<any>(`addScheduledEmail`))
      );
  }

  private log(message: string) {
    console.log('EmailScheduleService: ' + message);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
