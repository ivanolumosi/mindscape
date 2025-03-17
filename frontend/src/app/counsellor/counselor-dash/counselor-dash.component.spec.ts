import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounselorDashComponent } from './counselor-dash.component';

describe('CounselorDashComponent', () => {
  let component: CounselorDashComponent;
  let fixture: ComponentFixture<CounselorDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounselorDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounselorDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
