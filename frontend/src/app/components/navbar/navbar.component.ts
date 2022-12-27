import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  connected: boolean = false

  constructor(
    public socketioService: SocketioService,
    public userService: UserService,
  ) {
    socketioService.connected.subscribe(res => {
      this.connected = res
    })
  }

  ngOnInit(): void {
  }


  disconnect() {
    this.socketioService.leaveBackend()
    this.userService.signOut()
  }
}
