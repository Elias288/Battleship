import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Player } from '../utils/player';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {  
    private _isLoggedIn$ = new BehaviorSubject<number>(0)
    // 0 => not logged
    // 1 => registered player
    // 2 => casual player
    isLoggedIn$ = this._isLoggedIn$.asObservable()

    private _player$ = new BehaviorSubject<Player>({ _id: '', username: '', email: '', score: 0, casual: false })
    player$ = this._player$.asObservable()

    private _onlinePlayers$ = new BehaviorSubject<Player[]>([])
    onlinePlayers$ = this._onlinePlayers$.asObservable()

    casual: boolean = false

    userInfo!: Player

    playerData!: Player;
    playerlist: Array<Player> = [];

    constructor(
        private httpService: HttpService,
        // public afs: AngularFirestore,
        // public afAuth: AngularFireAuth,
        
    ) {
        // this.afAuth.authState.subscribe((user: any) => {
        //   if (user) {
        //     // localStorage.setItem('user', JSON.stringify(user));
        //     this.login(user.name, undefined, user.email, user.uid, false)
        //   }
        // });

        this.token && this._isLoggedIn$.next(1)
        this.casualUsername && this._isLoggedIn$.next(2)
    }

    get token(): any {
        return localStorage.getItem('jwt')
    }

    get casualUsername(): any {
        return localStorage.getItem('casualUsername')
    }

    public login(username: string, password: string) {
        return this.httpService.login(username, password).pipe(
            tap((res: any) => {
                localStorage.setItem('jwt', res.jwt)
                this._isLoggedIn$.next(1)
            })
        )
    }

    public casualLogin(username: string) {
        return this.httpService.existPlayer(username).pipe(
            tap((res: any) => {
                console.log(res.message)
                if (res.message) {
                    this.setCasualInfo(username)
                    localStorage.setItem('casualUsername', username)
                    this._isLoggedIn$.next(2)
                }
            })
        )
    }

    public setCasualInfo(username: string) {
        const userInfo = { _id: uuidv4(), username, email: '', casual: true, score: 0 }
        this.setUserInfo(userInfo)
    }

    public logout() {
        localStorage.removeItem('jwt')
        localStorage.removeItem('casualUsername')
        this._isLoggedIn$.next(0)
        window.location.href="/"
    }

    public getPlayer() {
        return this.httpService.getPlayerInfo(this.token).pipe(
            tap((res: any) => {
                this.setUserInfo({ ...res, casual: false })
            })
        )
    }

    public setUserInfo (user: Player) {
        this._player$.next(user)
        this.userInfo = user
    }

    public setOnlineUsers (players: Player[]) {
        this._onlinePlayers$.next(players)
    }

    /* 
    googleAuth() {
        return this.authLogin(new firebase.auth.GoogleAuthProvider())

    }

    authLogin(provider: any): Promise<any> {
        return this.afAuth
            .signInWithPopup(provider)
            .then((result: any) => {
                return result.user
            })
    }

    signOut() {
        return this.afAuth.signOut().then(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = "/";
        });
    } */
}
