import { Component, inject, signal } from '@angular/core';
import { WorldMapComponent } from './components/world-map/world-map';
import { BatleComponent } from "./components/batle/batle";
import { InventoryComponent } from './components/inventory/inventory';
import { GameStateService } from './services/game-state';
import { SocketService } from './services/socket';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorldMapComponent, BatleComponent, InventoryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public gameState = inject(GameStateService);
  public socketService = inject(SocketService);
  protected readonly title = 'Heroes of Angular';

  onLogin(username: string) {
    this.socketService.login(username);
  }

  chatMessage = signal<string>('');

  send() {
    if (this.chatMessage().trim()) {
      this.socketService.sendMessage('aaa', this.chatMessage());
      this.chatMessage.set('');
    }
  }
}
