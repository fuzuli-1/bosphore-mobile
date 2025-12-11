import { TestBed } from '@angular/core/testing';

import { MenuGroupItemService } from './menu-group-item-service';

describe('MenuGroupItemService', () => {
  let service: MenuGroupItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuGroupItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
