import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hud } from './hud';

describe('Hud', () => {
  let component: Hud;
  let fixture: ComponentFixture<Hud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
