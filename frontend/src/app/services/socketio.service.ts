import { Location } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Match } from '../utils/match';
import { Player } from '../utils/player';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  connected: EventEmitter<any> = new EventEmitter();
  matchData: EventEmitter<Match> = new EventEmitter();

  constructor(
    private userService: UserService,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT)

    this.socket.on('error', (data: Array<any>) => {
      window.localStorage.removeItem('ships')
      window.localStorage.setItem('error', JSON.stringify(data))
      throw new Error('C - ' + data)
    })

    this.socket.on('playerList', (res: Array<Player>) => {
      localStorage.removeItem('error')
      userService.setPlayers(res)
    })
    
    this.socket.on('matches', (res: Match) => this.matchData.emit(res))
    
    this.socket.on('joined', (res: Boolean) => this.connected.emit(res))

    this.socket.on('isConnected', (res: Boolean) => this.connected.emit(res))

    this.socket.on('disconnect', () => {
      this.connected.emit(false)
      userService.setPlayers([])
    })
  }

  public isConnected() {
    this.socket.emit('isConnected', null)
  }
  
  public joinBackend() {
    localStorage.removeItem('error')

    this.socket.emit('join', { 
      name: this.userService.user.displayName,
      uid: this.userService.user.uid,
      /* email: this.userService.user.email */
    })
  }

  public leaveBackend() {
    this.socket.emit('leave', '')
  }

  public connectToMatch(roomId: string) {
    this.socket.emit('addToMatch', { 
      uid: this.userService.user.uid,
      matchId: roomId,
    })
  }

  public startGame() {
    this.socket.emit('startGame', null)
  }

  public changeTurn() {
    this.socket.emit('changeTurn', null)
  }
}
