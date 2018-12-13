import { TestBed, inject } from '@angular/core/testing';

import { EmailScheduleService } from './email-schedule.service';

describe('EmailScheduleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailScheduleService]
    });
  });

  it('should be created', inject([EmailScheduleService], (service: EmailScheduleService) => {
    expect(service).toBeTruthy();
  }));
});
