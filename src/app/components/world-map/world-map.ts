import { Component } from '@angular/core';
import { MapService } from '../../services/map';
import { Point, Tile } from '../../models/interfaces';

@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css'
})

export class WorldMapComponent{
  constructor(public mapService: MapService) { }
  isMoving = false;
  transitionDuration = 1.1;
  heroTransform = `translate(0px, 0px)`;

  // After click on tile move hero
  async onTileClick(target: Point) {
    if(this.isMoving){
      return;
    }
    if (this.mapService.canMoveTo(target)) 
    {
      this.isMoving = true;
      const path = this.getPath(target);
      if(path === null){
        return;
      }
      
      for(const tile of path){
        await this.translateHero(tile);
      }

      this.mapService.removeFog(target);
      this.mapService.isMonsterStartFight(target);
    }
    this.isMoving = false;
  }

  // Get new duration
  calculateTransitionDuration(target: Point){
    const pos = this.mapService.gameState.heroPosition();
    const distance = Math.hypot(target.x - pos.x, target.y - pos.y);
    const speed = 2;

    this.transitionDuration = distance / speed;
  }

  // Move hero
  async translateHero(target: Point){
      this.calculateTransitionDuration(target);

      const tx = target.y * this.mapService.TILE_SIZE;
      const ty = target.x * this.mapService.TILE_SIZE;
      this.heroTransform = `translate(${tx}px, ${ty}px)`;

      this.mapService.gameState.heroPosition.set(target);

      await this.mapService.gameState.sleep((this.transitionDuration + 0.1) * 1000);
  }

  getPathASource(target : Point){
    const pos = this.mapService.gameState.heroPosition();
    const map = this.mapService.map();
  }

  // Calculate path to point
  getPath(target: Point){
    const pos = this.mapService.gameState.heroPosition();
    const map = this.mapService.map();
    const visited = Array.from({ length: map.length }, () => 
      new Array(map[0].length).fill(false));    
    return this.getPathRec(map, visited, pos, target, []);
  }

  getPathRec(map: Tile[][], visited: boolean[][], current: Point, target: Point, path: Point[]): Point[] | null{
    if(current.x === target.x && current.y === target.y){
      return [...path, current];
    }

    if (
    this.mapService.isValid(target) || visited[current.x][current.y] || this.mapService.canMoveTo(target)) {
      return null;
    }

    visited[current.x][current.y] = true;
    const newPath = [...path, current];
    const neighbours = this.getNeighbours(current);
    for(const neighbour of neighbours){
      const result = this.getPathRec(map, visited, neighbour, target, newPath);
      if(result){
        return result;
      }
    }
    return null;
  }

  getNeighbours(p: Point){
    const neighbours: Point[] = [];
    const offsets = [
      {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}
    ];

    for (const offset of offsets) {
      neighbours.push({ x: p.x + offset.x, y: p.y + offset.y });
    }
    return neighbours;
  }
}
