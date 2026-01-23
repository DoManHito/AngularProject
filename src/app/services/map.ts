import { inject, Injectable, signal } from '@angular/core';
import { Tile, Point } from '../models/interfaces';
import { GameStateService } from './game-state';

@Injectable({
  providedIn: 'root'
})

export class MapService {
  public readonly gameState = inject(GameStateService);
  readonly MAP_SIZE = 20;
  readonly TILE_SIZE = 60;

  map = signal<Tile[][]>([]);

  constructor() {
    document.documentElement.style.setProperty('--map-size', this.MAP_SIZE.toString());
    document.documentElement.style.setProperty('--tile-size', this.TILE_SIZE.toString() + 'px');
    document.documentElement.style.setProperty('--content-size', (this.TILE_SIZE / 2).toString() + 'px');
    this.generateMap();
  }

  // TODO: rebuild to perlin noise
  // Generate map
  private generateMap() {
    this.generateArea();
    this.removeFog({x : 1, y: 1});
    //this.removeAllFog();
  }

  // Generate landscape
  private generateArea(){
    const newMap: Tile[][] = [];
    for (let i = 0; i < this.MAP_SIZE; i++) {
      const row = <Tile[]>([]);
      for (let j = 0; j < this.MAP_SIZE; j++) {
        if(i == 0 && j == 0){ // Skip 0,0
          this.pushIntoTile(row, true, true);
          continue;
        }
        const isPassable = Math.random() < 0.8; 
        const waterOrMauntain = (Math.random() < 0.55) ? 'mountain' : 'water';
        this.pushIntoTile(row, isPassable, waterOrMauntain);
      }
      newMap.push(row);
    }
    this.map.set(newMap);
  }

  // Generate constent
  private generateRandomContent() {
    const rand = Math.random();
    if (rand > 0.95) return { id: '1', type: 'resource', value: 500, icon: '💰' } as const;
    if (rand > 0.88) return { id: '2', type: 'monster', value: 'Goblins', icon: '👺' } as const;
    return undefined;
  }

  pushIntoTile(row: Tile[], isPassable: boolean, waterOrMauntain: any){
    row.push({
      type: isPassable ? 'grass' : waterOrMauntain,
      isPassable: isPassable,
      content: isPassable ? this.generateRandomContent() : undefined,
      isVisible: false
    });
  }

  // Remove fog of war around hero
  removeFog(target: Point){
    const range = 2;
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        if (this.isValid({x : target.x + i, y : target.y + j})) {
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

  // Return true if point is unblocked 
  canMoveTo(target: Point): boolean {
    const tile = this.map()[target.x][target.y];
    return (tile.isPassable && tile.isVisible)
  }

  isValid(target : Point){
    return !(target.x < 0 || target.y < 0 || target.x >= this.map().length || target.y >= this.map()[0].length)
  }

  // Get type of field
  getType(target: Point){
    const tile = this.map()[target.x][target.y];
    return tile.content?.type;
  }

  // Start fight if monster on target
  isMonsterStartFight(target: Point){
    if (this.getType(target) === 'monster'){
      this.gameState.startFigth(target);
    }
  }

  // Get money from bag
  isMoney(target: Point){
    if (this.getType(target) === 'resource'){
      this.gameState.currentMoney += 100;
      this.map()[target.x][target.y].content = undefined;
    }
  }
}