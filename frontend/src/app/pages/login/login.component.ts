import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  faGoogle = faGoogle;
  loginForm!: FormGroup
  loginCasualForm!: FormGroup
  hide: boolean = true;
  casual: boolean = false

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private _snackBar: MatSnackBar,
  ) {
    this.playerService.isLoggedIn$.subscribe(status => {
      if (status) this.router.navigate(['home'])
    })
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl("", [
          Validators.required,
          Validators.minLength(3),
      ]),
      password: new FormControl("", [
          Validators.required,
          Validators.minLength(3),
      ])
    })

    this.loginCasualForm = new FormGroup ({
      username: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ])
    })
  }

  PlayerLogin() {
    const { username, password } = this.loginForm.value

    if (!this.casual) {
      this.playerService.login(username, password).subscribe({
        error: (e) => {
          this._snackBar.open(e.error.errorMessage, 'close', { duration: 5000 })
        }
      })
    }
    
    if (this.casual) {
      const { username } = this.loginCasualForm.value
      this.playerService.casualLogin(username).subscribe({
        error: (e) => {
          console.log(e);
          this._snackBar.open(e.error.errorMessage, 'close', { duration: 5000 })
        }
      })
    }
  }

  toggleCasual() {
    this.casual = !this.casual
  }

  googlePlayerLogin(): void {
    alert('no implementado aún')
    // const res = this.userService.googleAuth()
    // console.log(res); 
  }
}
