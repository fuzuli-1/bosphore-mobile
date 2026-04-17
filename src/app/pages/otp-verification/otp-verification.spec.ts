import { TestBed } from '@angular/core/testing';

import { OtpVerification } from './otp-verification';

describe('OtpVerification', () => {
  let service: OtpVerification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpVerification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
