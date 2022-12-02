import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from 'src/app/services/match.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(
    public socketIoService: SocketioService,
    public matchService: MatchService,
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
  ) {}

  ngOnInit(): void {
    this.socketIoService.isConnected()

    this.activatedRoute.params.subscribe((params) => {
      // if (!this.socketIoService.connected){
      //   this.socketIoService.joinBackend()
      // }
      this.socketIoService.connectToMatch(params['roomId'])
    })
    
  }

}
