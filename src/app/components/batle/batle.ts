import { Component } from '@angular/core';
import { GameState } from '../../services/game-state';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})
export class Batle {
  constructor(public gameState : GameState) {};
}
