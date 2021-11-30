import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditSupplyComponent } from './create-edit-supply.component';

describe('CreateEditSupplyComponent', () => {
  let component: CreateEditSupplyComponent;
  let fixture: ComponentFixture<CreateEditSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditSupplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
