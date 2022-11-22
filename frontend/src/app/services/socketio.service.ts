import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Match } from '../utils/match';
import { Player } from '../utils/player';
import { GameService } from './game.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  connected: boolean = false;

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private location: Location,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT)

    this.listen('error').subscribe((data: Array<any>) => {
      localStorage.setItem('error', JSON.stringify(data))
      console.log(data)
      throw new Error('C - ' + data)
    })
    
    this.listen('playerList').subscribe((data: Array<Player>) => {
      localStorage.removeItem('error')
      this.userService.setPlayers(data)
    })
    
    this.listen('matches').subscribe((data: Match) => {
      console.log(data);
      this.gameService.joinGame(data)
    })

    this.listen('isConnected').subscribe((data: boolean) => {
      this.connected = data
      // console.log(data)
      if (!data) {
        this.location.back()
      }
    })

    this.listen('canStart').subscribe((data: boolean) => {
      console.log('canconected: ', data)
    })
  }

  private listen(eventName: string): Observable<any> {
    return new Observable(subscriber => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data)
      })
    })
  }

  isConnected() {
    this.socket.emit('isConnected', null)
  }
  
  joinBackend() {
    localStorage.removeItem('error')

    this.socket.emit('join', { 
      name: this.userService.user.displayName,
      uid: this.userService.user.uid,
      email: this.userService.user.email
    })
    // console.log('connected')
    this.connected = true
  }

  leaveBackend() {
    this.socket.emit('leave', '')
    this.connected = false
  }

  connectToMatch(roomId: string) {
    this.socket.emit('addToMatch', { 
      matchId: roomId,
      uid: this.userService.user.uid
    })
  }

  disconnectToMatch(){
    this.socket.emit('removeToMatch', '')
    this.gameService.leaveGame()
    window.location.href="/home";
  }
}
