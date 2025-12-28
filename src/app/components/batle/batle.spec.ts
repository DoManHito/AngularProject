import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Batle } from './batle';

describe('Batle', () => {
  let component: Batle;
  let fixture: ComponentFixture<Batle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Batle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Batle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
