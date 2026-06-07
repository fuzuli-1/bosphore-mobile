import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdresMapPage } from './adres-map.page';

describe('AdresMapPage', () => {
  let component: AdresMapPage;
  let fixture: ComponentFixture<AdresMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdresMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
