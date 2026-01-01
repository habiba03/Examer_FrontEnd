import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToExamComponent } from './add-user-to-exam.component';

describe('AddUserToExamComponent', () => {
  let component: AddUserToExamComponent;
  let fixture: ComponentFixture<AddUserToExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserToExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserToExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
