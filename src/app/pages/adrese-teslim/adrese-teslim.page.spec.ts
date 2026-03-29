import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdreseTeslimPage } from './adrese-teslim.page';

describe('AdreseTeslimPage', () => {
  let component: AdreseTeslimPage;
  let fixture: ComponentFixture<AdreseTeslimPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdreseTeslimPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
