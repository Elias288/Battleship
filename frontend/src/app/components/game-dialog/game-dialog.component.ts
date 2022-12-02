import { Component, Inject, NgModule } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatchService } from 'src/app/services/match.service';
import { faShareFromSquare } from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-dialog',
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.scss']
})
export class GameDialogComponent {
  faShareFromSquare = faShareFromSquare;

  constructor(
    public dialogRef: MatDialogRef<GameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public gameService: MatchService,
    public router: Router,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(){
    // this.gameService.setRoomId(this.roomId)
    this.dialogRef.close();
    this.router.navigate(['/game/', this.data.roomId ])
  }
}
