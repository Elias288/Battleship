import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Player } from 'src/app/utils/player';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  playerInfo!: Player

  showPlayers: Boolean = false
  onlinePlayers!: Array<any>

  constructor(
    private playerService: PlayerService,
  ) {
    playerService.player$.subscribe(player => {
      this.playerInfo = player
    })

    playerService.onlinePlayers$.subscribe(onlinePlayers => {
      this.onlinePlayers = onlinePlayers.map(player => { return { username: player.username } } )
    })
  }

  ngOnInit(): void {
  }

  logout() {
    this.playerService.logout()
  }

  toggleShowPlayer() {
    this.showPlayers = !this.showPlayers
  }
}
