import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionManagementPage } from './option-management.page';

describe('OptionManagementPage', () => {
  let component: OptionManagementPage;
  let fixture: ComponentFixture<OptionManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
