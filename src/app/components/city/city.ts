import { Component } from '@angular/core';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-city',
  imports: [],
  templateUrl: './city.html',
  styleUrl: './city.css',
})
export class City {
  constructor(public socketService : SocketService){

  }

  isLoggedIn = false;

  start(name: string) {
    if (name.trim()) {
      this.socketService.login(name);
      this.isLoggedIn = true;
    }
  }

  challengePlayer(targetUser: string) {
    console.log('Start fight:', targetUser);
  }
}
