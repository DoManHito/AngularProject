import { Component, effect, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state';
import { BatleFloor } from '../../models/interfaces';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})

export class BatleComponent {
  constructor(public gameState : GameStateService) {
    effect(() => {
      if(this.gameState.isBatle()){
        this.generateBatleMap();
      }
    })
  };
  batleMap = signal<BatleFloor[][]>([]);
  batleMapX = 16;
  balteMapY = 8;

  generateBatleMap(){
    const newBatleMap : BatleFloor[][] = [];
    for (let i = 0; i < this.batleMapX; i++) {
      const row : BatleFloor[] = [];
      for (let j = 0; j < this.balteMapY; j++) {
        row.push({
          type: 'arena-floor',
          isPassable: true,
        });
      }
      newBatleMap.push(row)
    }
    this.batleMap.set(newBatleMap);
  }
}
