import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket = io('http://localhost:3000');
  
  public messages = signal<{user: string, text: string, time: string}[]>([]);
  public onlineUsers = signal<string[]>([]);
  public currentUser = signal<string | null>(null);

  constructor() {
    this.socket.on('update_user_list', (users: string[]) => {
      this.onlineUsers.set(users);
    });
  }

  login(username: string) {
    this.currentUser.set(username);
    this.socket.emit('set_username', username);
  }

  sendMessage(user: string, text: string) {
    this.socket.emit('send_message', { user, text });
  }
}