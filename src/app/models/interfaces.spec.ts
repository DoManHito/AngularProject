import { TestBed } from '@angular/core/testing';

import { Interfaces } from './interfaces';

describe('Interfaces', () => {
  let service: Interfaces;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Interfaces);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
