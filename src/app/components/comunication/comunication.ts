import { Component, ViewChild, ElementRef, effect } from '@angular/core';
import { SocketService } from '../../services/socket';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comunication',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './comunication.html',
  styleUrl: './comunication.css',
})

export class ComunicationComponent {
  @ViewChild('scrollContainer') private readonly scrollContainer!: ElementRef;

  activeTab: 'general' | 'private' = 'general';
  selectedPrivateUser: string | null = null;
  isLoggedIn = false;
  chatMessage = '';
  
  constructor(public socketService : SocketService){
    effect(() => {
      const _ = this.socketService.messages();
      
      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    });
  }

  get chatPartners() {
    return Object.keys(this.socketService.privateMessages());
  }
  
  setPrivateTarget(user: string) {
    this.selectedPrivateUser = user;
    this.activeTab = 'private';
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  start(name: string) {
    if (name?.trim()) {
      this.socketService.login(name);
      this.isLoggedIn = true;
    } else {
      alert('Please enter a name');
    }
  }

  send() {
    if (!this.chatMessage.trim()) return;

    const user = this.socketService.currentUser();
    if (this.activeTab === 'general') {
      this.socketService.sendMessage(user!, this.chatMessage);
    } else if (this.selectedPrivateUser) {
      this.socketService.sendPrivateMessage(this.selectedPrivateUser, this.chatMessage);
    }
    this.chatMessage = '';
    
  }
}
