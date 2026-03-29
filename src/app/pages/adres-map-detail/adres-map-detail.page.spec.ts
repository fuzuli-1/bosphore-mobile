import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdresMapDetailPage } from './adres-map-detail.page';

describe('AdresMapDetailPage', () => {
  let component: AdresMapDetailPage;
  let fixture: ComponentFixture<AdresMapDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdresMapDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
