import { TestBed } from '@angular/core/testing';

import { OptionItemService } from './option-item-service';

describe('OptionItemService', () => {
  let service: OptionItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptionItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
