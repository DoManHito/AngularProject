import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameState {
  public isBatle = signal<boolean>(false);
  
  startFigth(){
    this.isBatle.set(true);
  }
  endFight(){
    this.isBatle.set(false);
  }
}
