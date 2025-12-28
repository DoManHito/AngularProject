import { Component, inject } from '@angular/core';
import { WorldMapComponent } from './components/world-map/world-map';
import { Batle } from "./components/batle/batle";
import { GameState } from './services/game-state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorldMapComponent, Batle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public gameState = inject(GameState);
  protected readonly title = 'Heroes of Angular';
}
