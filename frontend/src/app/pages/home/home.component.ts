import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameDialogComponent } from 'src/app/components/game-dialog/game-dialog.component';
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
    public socketIoService: SocketioService,
    public userService: UserService,
    public dialog: MatDialog,
  ) {
    socketIoService.isConnected()
    socketIoService.connected.subscribe((res) => {
      if (!res) {
        this.socketIoService.joinBackend()
      }
    })
    window.localStorage.removeItem('ships')
  }

  displayedColumns: string[] = ['name', 'score'];
  roomId: string = uuidv4().substring(0,8)

  ngOnInit(): void {}

  openDialog(create: boolean): void {
    const dialogRef = this.dialog.open(GameDialogComponent, {
      data: { create, roomId: create ? this.roomId: '' },
    });

    // dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      // this.result = result;
    // });
  }

}
