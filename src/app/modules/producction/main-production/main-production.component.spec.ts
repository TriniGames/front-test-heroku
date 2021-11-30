import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainProductionComponent } from './main-production.component';

describe('MainProductionComponent', () => {
  let component: MainProductionComponent;
  let fixture: ComponentFixture<MainProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainProductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
