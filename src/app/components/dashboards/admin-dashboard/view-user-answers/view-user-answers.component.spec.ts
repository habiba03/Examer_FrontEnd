import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserAnswersComponent } from './view-user-answers.component';

describe('ViewUserAnswersComponent', () => {
  let component: ViewUserAnswersComponent;
  let fixture: ComponentFixture<ViewUserAnswersComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUserAnswersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewUserAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
