import { Component } from '@angular/core';
import { MapService } from '../../services/map';
import { Point } from '../../models/interfaces';


@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css',
})

export class WorldMapComponent{
  constructor(public mapService: MapService) {}

  onTileClick(target: Point) {
    if (this.mapService.canMoveTo(target)) 
    {
      this.mapService.gameState.heroPosition.set(target);
      this.mapService.removeFog(target);
      this.mapService.isMonsterStartFight(target) ;
    }
  }
}
