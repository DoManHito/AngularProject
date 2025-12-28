import { Component, signal } from '@angular/core';
import { MapService } from '../../services/map';


@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css',
})

export class WorldMapComponent{
  heroPosition = signal<number>(0);
  // Внедряем сервис
  constructor(public mapService: MapService) {}
  movementPoints = signal<number>(200); // Запас хода на день

  onTileClick(index: number) {
    const x = index % this.mapService.MAP_SIZE;
    const y = Math.floor(index / this.mapService.MAP_SIZE);
    
    // Рассчитываем расстояние (упрощенно: разница координат)
    const currentX = this.heroPosition() % this.mapService.MAP_SIZE;
    const currentY = Math.floor(this.heroPosition() / this.mapService.MAP_SIZE);
    const distance = Math.abs(x - currentX) + Math.abs(y - currentY);

    if (this.mapService.canMoveTo({ x, y }) && this.movementPoints() >= distance) 
    {
      this.heroPosition.set(index);
      // Вычитаем очки хода
      this.movementPoints.update(pts => pts - distance);
      this.mapService.isMonster({x, y}) 
    } 
    else if (this.movementPoints() < distance) 
    {
      alert('Слишком далеко! Нужно больше очков хода.');
    }
  }
}
