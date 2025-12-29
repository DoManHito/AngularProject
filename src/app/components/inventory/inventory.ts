import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory';

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent {
  constructor(public inv : InventoryService) {}
  openInventory(){
    alert("open")
  }
}
