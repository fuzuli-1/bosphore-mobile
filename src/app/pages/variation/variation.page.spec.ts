import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariationPage } from './variation.page';

describe('VariationPage', () => {
  let component: VariationPage;
  let fixture: ComponentFixture<VariationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
