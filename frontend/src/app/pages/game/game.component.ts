import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('canvas', { static: true }) canvas: any;

  private ctx = CanvasRenderingContext2D;

  constructor(
    public socketIoService: SocketioService,
    public matchService: MatchService,
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
  ) {}

  ngOnInit(): void {
    if (!this.socketIoService.connected){
      this.socketIoService.joinBackend()
    }

    this.activatedRoute.params.subscribe((params) => {
      setTimeout(() => {
        this.socketIoService.connectToMatch(params['roomId'])
      }, 1000)
    })

    this.ctx = this.canvas.nativeElement.getContext('2d');
    
  }

}
