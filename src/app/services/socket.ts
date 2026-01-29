import { Injectable, signal } from '@angular/core';
import { Message, Unit } from '../models/interfaces';
import { io } from 'socket.io-client';
import { GameStateService } from './game-state';
import { InventoryService } from './inventory';

@Injectable({ providedIn: 'root' })
export class SocketService {
  readonly socket = io('http://localhost:3000');
  
  public messages = signal<Message[]>([]);
  public battleMessages = signal<any[]>([]);
  public privateMessages = signal<Record<string, any[]>>({});

  public onlineUsers = signal<string[]>([]);
  public currentUser = signal<string | null>(null);
  public incomingChallenge = signal<string | null>(null);

  public opponentUnits = signal<Unit[] | null>(null);
  public opponentName = signal<string | null>(null);
  public currentBattleId = signal<string | null>(null);
  public role = signal<string | null>(null);
  public battleEndReason = signal<{winner: boolean, reason: string} | null>(null);

  constructor(private readonly gameState: GameStateService, private readonly inventory: InventoryService) {
    this.socket.on('game_start', (data: { 
        battleId: string, 
        opponentName: string, 
        opponentUnits: Unit[], 
        role: string 
    }) => {
        console.log('Game Start Data:', data);
        
        this.currentBattleId.set(data.battleId);
        this.opponentUnits.set(data.opponentUnits);
        this.opponentName.set(data.opponentName);
        this.role.set(data.role);
        
        this.incomingChallenge.set(null); 
        
        this.gameState.isBatle.set(true);
    });
    this.socket.on('update_user_list', (users: string[]) => {
      this.onlineUsers.set(users);
    });
    this.socket.on('receive_message', (newMessage) => {
        this.messages.update(prev => [...prev, newMessage]);
    });
    this.socket.on('receive_challenge', (data: { from: string }) => {
        this.incomingChallenge.set(data.from);
    });
    this.socket.on('receive_battle_message', (message) => {
      this.battleMessages.update(prev => [...prev, message]);
    });
    this.socket.on('receive_private_message', (msg) => {
        const partner = msg.from.startsWith('To: ') ? msg.from.replace('To: ', '') : msg.from;
        this.privateMessages.update(prev => {
            const history = prev[partner] || [];
            return {
                ...prev,
                [partner]: [...history, msg]
            };
        });
    });
    this.socket.on('battle_end_signal', (data) => {
      this.battleMessages.update(msgs => [
          ...msgs, 
          { 
              user: 'SYSTEM', 
              text: `Batle end: ${data.reason}`, 
              time: new Date().toLocaleTimeString() 
          }
      ]);
      this.battleEndReason.set(data);
    });
  }

  leaveBattle() {
    this.socket.emit('leave_battle');
    this.cleanupBattleState();
  }

  cleanupBattleState() {
    this.gameState.isBatle.set(false);
    this.battleMessages.set([]);
    this.currentBattleId.set(null);
    this.battleEndReason.set(null);
    this.opponentUnits.set(null);
  }

  sendChallenge(targetUser: string) {
    this.socket.emit('send_challenge', { 
      targetUser, 
      units: this.inventory.units() 
    });
  }

  sendPrivateMessage(targetUser: string, text: string) {
    this.socket.emit('send_private_message', { targetUsername: targetUser, text });
  }

  acceptChallenge() {
    const challenger = this.incomingChallenge();
      if (challenger) {
        this.socket.emit('accept_challenge', { 
          challenger, 
          units: this.inventory.units() 
        });
    }
  }

  declineChallenge() {
    this.incomingChallenge.set(null);
  }

  login(username: string) {
    this.currentUser.set(username);
    this.socket.emit('set_username', username);
  }

  sendBattleAction(battleId: string, type: 'move' | 'attack', payload: any) {
    this.currentBattleId.set(battleId);
    this.socket.emit('battle_action', { battleId, type, payload });
  }

  sendMessage(user: string, text: string) {
    this.socket.emit('send_message', { user, text });
  }

  sendBattleMessage(text: string) {
    const battleId = this.currentBattleId();
    const user = this.currentUser();
    if (battleId && user) {
        this.socket.emit('send_battle_message', { battleId, text, user });
    }
  }
}