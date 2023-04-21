import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { GameDialogComponent } from 'src/app/components/game-dialog/game-dialog.component';
import { SocketioService } from 'src/app/services/socketio.service';
import { PlayerService } from '../../services/player.service';
import { Player } from 'src/app/utils/player';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // displayedColumns: string[] = ['name', 'score'];
  // roomId: string = uuidv4().substring(0,8)

  constructor(
    public socketIoService: SocketioService,
    public playerService: PlayerService,
    private _snackBar: MatSnackBar,
    // private router: Router,
    // public dialog: MatDialog,
  ) {
    // this.socketIoService.joinBackend()
    
    // window.localStorage.removeItem('ships')

    playerService.player$.subscribe(player => {
      if (player.username != '') {
        this.socketIoService.joinBackend(player.username, player._id, player.email, player.casual)
      }
    })

    socketIoService.getWebSocketError((error: any) => {
      this._snackBar.open(error.errorMessage, 'close', { duration: 5000 })
    })

    this.socketIoService.getOnlinePlayers((onlinePlayers: Player[]) => {
      playerService.setOnlineUsers(onlinePlayers)
    })
  }

  ngOnInit(): void {}

  // openDialog(create: boolean): void {
  //   const dialogRef = this.dialog.open(GameDialogComponent, {
  //     data: { create, roomId: create ? this.roomId: '' },
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //     this.result = result;
  //   });
  // }
}
