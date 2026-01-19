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
  
  readonly batleMapX = 12;
  readonly batleMapY = this.batleMapX / 2;
  readonly batleMapTileSize = 120;

  constructor(public gameState : GameStateService, public inventory : InventoryService) {
    document.documentElement.style.setProperty('--map-x', this.batleMapX.toString());
    document.documentElement.style.setProperty('--map-y', this.batleMapY.toString());
    document.documentElement.style.setProperty('--batle-tile-size', this.batleMapTileSize.toString() + 'px');
    document.documentElement.style.setProperty('--unit-size', (this.batleMapTileSize / 2).toString() + 'px');
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
      const unitAtTarget : Unit = this.getUnitAt(target);
      if(unitAtTarget){
        this.activeUnit.set(unitAtTarget);
        this.activatePosiblePath(target, unitAtTarget.speed);
        return;
      }

      if(this.activeUnit() && !unitAtTarget){
        this.changePosition(target);
      }
    }

    changePosition(target: Point){
      this.unitsInBattle.update(units => 
        units.map(u => {
          if (this.activeUnit() === u){
            return {...u, pos: {...target}};
          }
          return u;
        })
      );
      this.clearPosiblePath()
      this.activeUnit.set(null);
    }

  activatePosiblePath(startPos : Point, speed : number){
    this.batleMap.update(map => {
      return map.map((row, x) => 
        row.map((tile, y) => {
          const distance = Math.abs(startPos.x - x) + Math.abs(startPos.y - y);
          
          return {
            ...tile,
            status : (distance <= speed && tile.isPassable && !this.getUnitAt({x, y})),
          };
        })
      );
    });
  }

  clearPosiblePath(){
    this.batleMap.update(map => 
      map.map(row => row.map(tile => ({ ...tile, status : false}))))
  }

  // TODO
  async getPathBFS(target: Point): Promise<Point[] | null> {
    const start = this.gameState.heroPosition();
    const queue: { point: Point; path: Point[] }[] = [];

    queue.push({ point: start, path: [] });

    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const { point, path } = queue.shift()!;

      if (point.x === target.x && point.y === target.y) {
        return [...path, point].slice(1); 
      }

      const neighbours = this.getNeighbours(point);

      for (const neighbour of neighbours) {
        const key = `${neighbour.x},${neighbour.y}`;

        if (!visited.has(key)) {
          visited.add(key);

          queue.push({point: neighbour, path: [...path, point]});
        }
      }
    }

    return null;
  }

  getNeighbours(p: Point){
    const neighbours: Point[] = [];
    const offsets = [
      {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0},
      //{x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}
    ];

    for (const offset of offsets) {
      neighbours.push({ x: p.x + offset.x, y: p.y + offset.y });
    }
    return neighbours;
  }
}
