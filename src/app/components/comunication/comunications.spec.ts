import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comunication } from './comunication';

describe('Comunication', () => {
  let component: Comunication;
  let fixture: ComponentFixture<Comunication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comunication]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Comunication);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
