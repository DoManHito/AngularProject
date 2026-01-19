import { Component, effect, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state';
import { BatleFloor, Point, Unit } from '../../models/interfaces';
import { InventoryService } from '../../services/inventory';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})

export class BatleComponent {
  batleMap = signal<BatleFloor[][]>([]);
  unitsInBattle = signal<any[]>([]);
  activeUnit = signal<Unit | null>(null);
  
  batleMapX = 16;
  batleMapY = 8;

  constructor(public gameState : GameStateService, public inventory : InventoryService) {
    effect(() => {
      if(this.gameState.isBatle()){
        this.generateBatleMap();
        this.placeUnit();
      }
    })
  };

  generateBatleMap(){
    const newBatleMap : BatleFloor[][] = [];
    for (let i = 0; i < this.batleMapY; i++) {
      const row : BatleFloor[] = [];
      for (let j = 0; j < this.batleMapX; j++) {
        row.push({
          type: 'arena-floor',
          isPassable: true,
        });
      }
      newBatleMap.push(row)
    }
    this.batleMap.set(newBatleMap);
  }

    placeUnit(){
      const playerUnits = this.inventory.units().map((unit, index) => ({
        ...unit,
        side: 'player',
        pos: {x: index, y: 0}
      }))

      const enemy = [this.inventory.getWarrior(1, 'goblin')];
      const enemyUnits = enemy.map((unit, index) => ({
        ...unit,
        side: 'goblin',
        pos: {x: index, y: this.batleMapX - 1}
      }))

      this.unitsInBattle.set([...playerUnits, ...enemyUnits])
    }

    getUnitAt(target : Point){
      return this.unitsInBattle().find(u => (u.pos.x === target.x && u.pos.y === target.y));
    }

    onUnitClick(target : Point){
      const unit = this.getUnitAt(target);

      if(unit){
        this.activeUnit.set(unit);
        return;
      }

      if(this.activeUnit() && !unit){
        
      }
    }
}
