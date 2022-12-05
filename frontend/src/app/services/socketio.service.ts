import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Match } from '../utils/match';
import { Player } from '../utils/player';
import { MatchService } from './match.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  connected: Boolean = false;

  constructor(
    private userService: UserService,
    private matchService: MatchService,
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
      const playerData = this.userService.playerData;
      // console.log(playerData);

      this.matchService.joinMatch(data)
    })

    this.listen('joined').subscribe(() => {
      this.connected = true
    })
    this.listen('canStart').subscribe((data: boolean) => {
      console.log('canconected: ', data)
    })
    this.listen('disconnect').subscribe(() => {
      this.connected = false
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
      /* email: this.userService.user.email */
    })
  }

  leaveBackend() {
    this.socket.emit('leave', '')
    this.connected = false
  }

  connectToMatch(roomId: string) {
    if(!this.connected){
      this.location.back()
    }
    this.socket.emit('addToMatch', { 
      uid: this.userService.user.uid,
      matchId: roomId,
    })
  }

  disconnectToMatch(){
    this.socket.emit('removeToMatch', '')
    this.matchService.leaveMatch()
    window.location.href="/home";
  }
}
