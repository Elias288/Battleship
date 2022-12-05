import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { SocketioService } from './services/socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(
    public userService: UserService,
    public socketioService: SocketioService,
  ) {}

  disconnect() {
    this.socketioService.leaveBackend()
    this.userService.signOut()
  }
}
