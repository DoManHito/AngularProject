import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket = io('http://localhost:3000');
  
  // Сигнал для хранения сообщений
  public messages = signal<{user: string, text: string, time: string}[]>([]);

  constructor() {
    this.socket.on('receive_message', (data) => {
      this.messages.update(prev => [...prev, data]);
    });
  }

  sendMessage(user: string, text: string) {
    this.socket.emit('send_message', { user, text });
  }
}