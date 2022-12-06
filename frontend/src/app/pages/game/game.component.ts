import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { Match } from 'src/app/utils/match';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  match: Match | undefined;
  gameBoardSize: number[] = this.fillList(10)

  constructor(
    public socketIoService: SocketioService,
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
  ) {
    socketIoService.joinBackend()
    socketIoService.connected.subscribe(() => {
      this.activatedRoute.params.subscribe((params) => {
          setTimeout(() => {
            this.socketIoService.connectToMatch(params['roomId'])
          }, 1000)
        })
    })
    socketIoService.matchData.subscribe(match => {
      this.match = match
      this.gameBoardSize = this.fillList(match.fieldSize)
    })
  }

  ngOnInit(): void {}

  private fillList(amount: number) {
    let arr: number[] = []
    for (let index =0; index < amount; index++) {
      arr.push(index)
    }
    return arr
  }

}
