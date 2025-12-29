import { Injectable, signal } from '@angular/core';
import { Point } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  public isBatle = signal<boolean>(false);
  public heroPosition = signal<Point>({ x : 0, y : 0 });
  
  startFigth(){
    this.isBatle.set(true);
  }
  endFight(){
    this.isBatle.set(false);
  }
}
