import { TestBed } from '@angular/core/testing';

import { CounsellorManagementService } from './counsellor-management.service';

describe('CounsellorManagementService', () => {
  let service: CounsellorManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounsellorManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
