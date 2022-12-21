import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { SocketioService } from './services/socketio.service';
import { Player } from './utils/player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  connected: boolean = false

  constructor(
    public userService: UserService,
    public socketioService: SocketioService,
  ) {
    socketioService.connected.subscribe(res => {
      this.connected = res
    })
  }

  disconnect() {
    this.socketioService.leaveBackend()
    this.userService.signOut()
  }
}
