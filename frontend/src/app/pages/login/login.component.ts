import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  faGoogle = faGoogle;
  name: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('error')
    
    if(this.userService.isLoggedIn){
      this.router.navigate(['home'])
    }
  }

  anonimusPlayerLogin(): void {
    if (this.name.trim().length < 3){
      this.openSnackBar('Need a username')
      return
    }
    
    this.userService.anonimusLogin(this.name)
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'close');
  }

  googlePlayerLogin(): void {
    this.userService.googleAuth()
  }
}
