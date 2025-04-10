import { TestBed } from '@angular/core/testing';

import { CounsellorDashService } from './counsellor-dash.service';

describe('CounsellorDashService', () => {
  let service: CounsellorDashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounsellorDashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
