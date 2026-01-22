import { Injectable, signal } from '@angular/core';
import { Point } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  public isBatle = signal<boolean>(false);
  public heroPosition = signal<Point>({ x : 0, y : 0 });
  public currentTile = signal<Point | undefined>(undefined);
  public currentMoney = 100;
  
  startFigth(target : Point){
    this.currentTile.set(target)
    this.isBatle.set(true);
  }
  endFight(){
    this.isBatle.set(false);
  }
  async sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms));
  }
}
