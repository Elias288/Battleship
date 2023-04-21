import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
  ) { }

  login(username: string, password: string): Observable<Object>  {
    const headers = { 'Content-Type': 'application/json' }
    const body = { username, password }
    return this.http.post(`${environment.ENDPOINT}/api/user/login`, body, { 'headers': headers })
  }

  getPlayerInfo(jwt: string): Observable<Object> {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
    return this.http.get(`${environment.ENDPOINT}/api/user/me`, { 'headers': headers })
  }

  existPlayer(username: string): Observable<Object> {
    const headers = { 'Content-Type': 'application/json' }
    return this.http.get(`${environment.ENDPOINT}/api/user/existPlayer/${username}`, { 'headers': headers })
  }
}
