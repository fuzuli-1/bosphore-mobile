import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionGroupItemPage } from './option-group-item.page';

describe('OptionGroupItemPage', () => {
  let component: OptionGroupItemPage;
  let fixture: ComponentFixture<OptionGroupItemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionGroupItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
