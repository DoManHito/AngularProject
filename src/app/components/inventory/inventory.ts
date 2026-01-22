import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory';
import { GameStateService } from '../../services/game-state';

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent {
  isOpen = false;
  constructor(public inventoryService : InventoryService, public gameState : GameStateService) {}
  toggleInventory(){
    this.isOpen = !this.isOpen;
  }
}
