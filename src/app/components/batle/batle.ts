import { Component } from '@angular/core';
import { GameStateService } from '../../services/game-state';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})

export class BatleComponent {
  constructor(public gameState : GameStateService) {};
}
