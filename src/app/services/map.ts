import { inject, Injectable, signal } from '@angular/core';
import { Tile, Point, Hero } from '../models/interfaces';
import { GameState } from './game-state';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly gameState = inject(GameState);

  readonly MAP_SIZE = 20;

  map = signal<Tile[]>([]);

  constructor() {
    this.generateMap();
  }

  private generateMap() {
    const newMap: Tile[] = [];
    for (let i = 0; i < this.MAP_SIZE * this.MAP_SIZE; i++) {
      const isMountain = Math.random() < 0.2; 
      
      newMap.push({
        type: isMountain ? 'mountain' : 'grass',
        isPassable: !isMountain,
        content: isMountain ? undefined : this.generateRandomContent()
      });
    }
    this.map.set(newMap);
  }

  private generateRandomContent() {
    const rand = Math.random();
    if (rand > 0.95) return { id: '1', type: 'resource', value: 500, icon: '💰' } as const;
    if (rand > 0.88) return { id: '2', type: 'monster', value: 'Goblins', icon: '👺' } as const;
    return undefined;
  }

  // Проверка: может ли герой наступить на клетку
  canMoveTo(target: Point): boolean {
    const index = target.y * this.MAP_SIZE + target.x;
    const tile = this.map()[index];
    
    // Проверяем границы карты и проходимость типа ландшафта
    return (
      target.x >= 0 && target.x < this.MAP_SIZE &&
      target.y >= 0 && target.y < this.MAP_SIZE &&
      tile.isPassable
    );
  }

  // Get type of field
  getType(target: Point){
    const index = target.y * this.MAP_SIZE + target.x;
    const tile = this.map()[index];
    return tile.content?.type;
  }

  isMonster(target: Point){
    if (this.getType(target) === 'monster'){
      this.gameState.startFigth()
    }
  }
}