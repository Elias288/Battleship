import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketioService } from 'src/app/services/socketio.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  faGoogle = faGoogle;
  name: string = ""
  password: string = ""

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

  async anonimusPlayerLogin(): Promise<void> {
    if (this.name.trim().length < 3){
      this.openSnackBar('Need a username')
      return
    }
    if (this.password.trim().length < 4){
      this.openSnackBar('Invalid password')
      return
    }
    
    const res = await this.userService.anonimusLogin(this.name, this.password)
    // console.log(res)
    if (res.error) {
      this.openSnackBar(res.error)
      return
    }

    this.userService.getInfo(res.token)
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'close');
  }

  googlePlayerLogin(): void {
    const res = this.userService.googleAuth()
    console.log(res);
    
  }
}
