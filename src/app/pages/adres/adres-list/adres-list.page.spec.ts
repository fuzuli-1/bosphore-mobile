import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdresListPage } from './adres-list.page';

describe('AdresListPage', () => {
  let component: AdresListPage;
  let fixture: ComponentFixture<AdresListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdresListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
