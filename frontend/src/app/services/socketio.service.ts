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
  attack: EventEmitter<string> = new EventEmitter();

  constructor(
    private userService: UserService,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT)

    this.socket.on('error', (data: Array<any>) => this.error(data))

    this.socket.on('playerList', (res: Array<Player>) => this.playerList(res))
    
    this.socket.on('matches', (res: Match) => this.matchData.emit(res))
    
    this.socket.on('joined', (res: Boolean) => this.connected.emit(res))

    this.socket.on('attack', (data: any) => this.attack.emit(data))

    this.socket.on('isConnected', (res: Boolean) => this.connected.emit(res))

    this.socket.on('disconnect', () => this.disconnect())
  }

  public isConnected() {
    this.socket.emit('isConnected', null)
  }
  
  public joinBackend() {
    localStorage.removeItem('error')
    const {displayName, uid, email} = this.userService.user

    this.socket.emit('join', { 
      name: displayName,
      uid,
      email
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

  public hit(id: string) {
    this.socket.emit('attack', id)
  }

  public hitResponse(id: string, status: boolean, ownerId: string) {
    this.socket.emit('hitStatus', {id, status, ownerId})
  }

  private playerList(res: Array<Player>) {
    localStorage.removeItem('error')
    this.userService.setPlayers(res)
  }

  private error(data: Array<any>) {
    window.localStorage.removeItem('ships')
    window.localStorage.setItem('error', JSON.stringify(data))
    throw new Error('C - ' + data)
  }
  
  private disconnect() {
    this.connected.emit(false)
    this.userService.setPlayers([])
  }
}
