import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionGroupPage } from './extra-group.page';

describe('OptionGroupPage', () => {
  let component: OptionGroupPage;
  let fixture: ComponentFixture<OptionGroupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
