import { Component, computed } from '@angular/core';
import { MapService } from '../../services/map';
import { Point } from '../../models/interfaces';

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
  heroStyle = computed(() => {
    const pos = this.mapService.gameState.heroPosition();
    const tx = pos.y * this.mapService.TILE_SIZE;
    const ty = pos.x * this.mapService.TILE_SIZE;
    return `translate(${tx}px, ${ty}px)`;
  });

  // After click on tile move hero
  async onTileClick(target: Point) {
    if(this.isMoving){
      return;
    }
    if (this.mapService.canMoveTo(target)) 
    {
      this.isMoving = true;
      const path = this.getPathBFS(target);
      if(path === null){
        this.isMoving = false;
        return;
      }
      
      for(const tile of await path ?? []){
        if(this.mapService.gameState.isBatle()){
          break;
        }
        await this.translateHero(tile);
        this.mapService.removeFog(tile);
        this.mapService.isMoney(tile);
        this.mapService.isMonsterStartFight(tile);
      }

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

      this.mapService.gameState.heroPosition.set(target);

      await this.mapService.gameState.sleep((this.transitionDuration + 0.1) * 1000);
  }

  // Calculate path to point
  async getPathBFS(target: Point): Promise<Point[] | null> {
    const start = this.mapService.gameState.heroPosition();
    const queue: { point: Point; path: Point[] }[] = [];
    
    // For visualisation
    //this.clearVisualization();
    //const map = this.mapService.map();

    queue.push({ point: start, path: [] });

    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const { point, path } = queue.shift()!;

      if (point.x === target.x && point.y === target.y) {
        return [...path, point].slice(1); 
      }
      else{
        // For visualisation
        //map[point.x][point.y].status = 'visited';
      }

      const neighbours = this.getNeighbours(point);

      for (const neighbour of neighbours) {
        const key = `${neighbour.x},${neighbour.y}`;

        if (this.mapService.isValid(neighbour) && this.mapService.canMoveTo(neighbour) && !visited.has(key)) {
          visited.add(key);

          // For visualisation
          //map[neighbour.x][neighbour.y].status = 'processing';

          queue.push({point: neighbour, path: [...path, point]});
        }
      }
      // For visualisation
      //await this.mapService.gameState.sleep(10);
    }

    return null;
  }

  // For visualisation
  clearVisualization() {
    const map = this.mapService.map();
    map.forEach(row => row.forEach(tile => tile.status = undefined));
  }

  // Get neighbours for point
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
