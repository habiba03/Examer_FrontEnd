import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedAdminsComponent } from './deleted-admins.component';

describe('DeletedAdminsComponent', () => {
  let component: DeletedAdminsComponent;
  let fixture: ComponentFixture<DeletedAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedAdminsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
