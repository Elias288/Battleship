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
    private location: Location,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT)

    this.listen('error').subscribe((data: Array<any>) => {
      localStorage.setItem('error', JSON.stringify(data))
      console.log(data)
      throw new Error('C - ' + data)
    })

    this.socket.on('playerList', (res: Array<Player>) => {
      localStorage.removeItem('error')
      userService.setPlayers(res)
    })
    
    this.socket.on('matches', (res: Match) => {
      this.matchData.emit(res)
    })
    
    this.socket.on('joined', (res: Boolean) => this.connected.emit(res))

    this.listen('canStart').subscribe((data: boolean) => {
      console.log('canconected: ', data)
    })

    this.socket.on('disconnect', () => {
      this.connected.emit(false)
      userService.setPlayers([])
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
    this.socket.emit('removeToMatch', true)
    window.location.href="/home";
  }
}
