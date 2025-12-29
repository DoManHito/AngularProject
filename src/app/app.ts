import { Component, inject } from '@angular/core';
import { WorldMapComponent } from './components/world-map/world-map';
import { BatleComponent } from "./components/batle/batle";
import { InventoryComponent } from './components/inventory/inventory';
import { GameStateService } from './services/game-state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorldMapComponent, BatleComponent, InventoryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public gameState = inject(GameStateService);
  protected readonly title = 'Heroes of Angular';
}
