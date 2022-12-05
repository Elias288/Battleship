import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  faGoogle = faGoogle;
  name: string = '';
  uuid: string = '';

  constructor(
    private router: Router,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('error')
    
    if(this.userService.isLoggedIn){
      this.router.navigate(['home'])
    }
  }

  loginTemporal(): void {
    this.userService.temporalLogin(this.name, this.uuid)
  }
}
