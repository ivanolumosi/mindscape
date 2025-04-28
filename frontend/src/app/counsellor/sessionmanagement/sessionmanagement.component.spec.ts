import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionmanagementComponent } from './sessionmanagement.component';

describe('SessionmanagementComponent', () => {
  let component: SessionmanagementComponent;
  let fixture: ComponentFixture<SessionmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
