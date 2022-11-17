import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(
    public socketIoService: SocketioService,
    public gameService: GameService,
    private activatedRoute: ActivatedRoute,
  ) { }

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
