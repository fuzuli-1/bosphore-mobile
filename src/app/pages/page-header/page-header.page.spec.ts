import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderPage } from './page-header.page';

describe('PageHeaderPage', () => {
  let component: PageHeaderPage;
  let fixture: ComponentFixture<PageHeaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
