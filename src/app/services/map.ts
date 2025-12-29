import { inject, Injectable, signal } from '@angular/core';
import { Tile, Point } from '../models/interfaces';
import { GameStateService } from './game-state';

@Injectable({
  providedIn: 'root'
})

export class MapService {
  public readonly gameState = inject(GameStateService);

  readonly MAP_SIZE = 20;

  map = signal<Tile[][]>([]);

  constructor() {
    this.generateMap();
  }

  // TODO: rebuild to perlin noise
  private generateMap() {
    document.documentElement.style.setProperty('--map-size', this.MAP_SIZE.toString());
    const newMap: Tile[][] = [];
    for (let i = 0; i < this.MAP_SIZE; i++) {
      const tile = <Tile[]>([]);
      for (let j = 0; j < this.MAP_SIZE; j++) {
        const isPassable = Math.random() < 0.25; 
        const waterOrMauntain = (Math.random() < 0.55) ? 'mountain' : 'water';
      
        tile.push({
          type: isPassable ? waterOrMauntain : 'grass',
          isPassable: !isPassable,
          content: isPassable ? undefined : this.generateRandomContent(),
          isVisible: true
        });
      }
      newMap.push(tile);
    }
    
    this.map.set(newMap);
    this.removeFog({x : 0, y: 0});
  }

  private generateRandomContent() {
    const rand = Math.random();
    if (rand > 0.95) return { id: '1', type: 'resource', value: 500, icon: '💰' } as const;
    if (rand > 0.88) return { id: '2', type: 'monster', value: 'Goblins', icon: '👺' } as const;
    return undefined;
  }

  // Remove fog of war around hero
  removeFog(target: Point){
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (target.x + i >= 0 && target.x + i < this.MAP_SIZE &&
            target.y + j >= 0 && target.y + j < this.MAP_SIZE) {
          this.map()[target.x + i][target.y + j].isVisible = true;
        }
      }
    }
  }

  // Remove all fog of war
  removeAllFog(){
    for (let i = 0; i < this.MAP_SIZE; i++) {
      for (let j = 0; j < this.MAP_SIZE; j++) {
          this.map()[i][j].isVisible = true;
      }
    }
  }

  // If hero can move to point
  canMoveTo(target: Point): boolean {
    const tile = this.map()[target.x][target.y];
    
    return (
      target.x >= 0 && target.x < this.MAP_SIZE &&
      target.y >= 0 && target.y < this.MAP_SIZE &&
      tile.isPassable
    );
  }

  // Get type of field
  getType(target: Point){
    const tile = this.map()[target.x][target.y];
    return tile.content?.type;
  }

  // Start fight if monster on target
  isMonsterStartFight(target: Point){
    if (this.getType(target) === 'monster'){
      this.gameState.startFigth();
    }
  }
}