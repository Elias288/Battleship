import { Component } from '@angular/core';
import { PlayerService } from './services/player.service';
import { Router } from '@angular/router';
import { Player } from './utils/player';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  connected: number = 0
  playerInfo!: Player

  constructor(
    public playerService: PlayerService,
    private router: Router,
    private _snackBar: MatSnackBar,
  ) {
    playerService.isLoggedIn$.subscribe((isConnected: number) => {
      this.connected = isConnected

      if (!isConnected) {
        this.router.navigate(['/'])
      }

      if (isConnected == 1) {
        playerService.getPlayer().subscribe({
          error: (e) => {
            const snackbarRef = this._snackBar.open(e.error.errorMessage, 'close', { duration: 5000 })
            snackbarRef.afterDismissed().subscribe(() => {
                window.localStorage.removeItem('jwt')
                window.location.href = '/'
            })
          }
        })
      }

      if (isConnected == 2) {
        this.playerService.setCasualInfo(this.playerService.casualUsername)
      }
    })
    
    playerService.player$.subscribe(player => {
      if (player._id) {
        this.playerInfo = player
      }
    })
  }
}
