import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuGroupsPage } from './menu-groups.page';

describe('MenuGroupsPage', () => {
  let component: MenuGroupsPage;
  let fixture: ComponentFixture<MenuGroupsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuGroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
