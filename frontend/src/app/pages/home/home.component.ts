import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameDialogComponent } from 'src/app/components/game-dialog/game-dialog.component';
import { MatchService } from 'src/app/services/match.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from '../../services/user.service';
import {v4 as uuidv4} from 'uuid'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private socketIoService: SocketioService,
    public userService: UserService,
    public gameService: MatchService,
    public dialog: MatDialog,
    private matchService: MatchService,
  ) { }

  displayedColumns: string[] = ['name', 'score'];
  roomId: string = uuidv4().substring(0,8)

  ngOnInit(): void {
    // this.socketIoService.isConnected()
    if (!this.socketIoService.connected){
      this.socketIoService.joinBackend()
    }
    this.matchService.leaveMatch()
  }

  openDialog(create: boolean): void {
    // this.socketIoService.isConnected()

    const dialogRef = this.dialog.open(GameDialogComponent, {
      data: { create, roomId: create ? this.roomId: '' },
    });

    // dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      // this.result = result;
    // });
  }

}
