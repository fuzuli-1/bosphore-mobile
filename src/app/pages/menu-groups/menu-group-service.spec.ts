import { TestBed } from '@angular/core/testing';

import { MenuGroupService } from './menu-group-service';

describe('MenuGroupService', () => {
  let service: MenuGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
