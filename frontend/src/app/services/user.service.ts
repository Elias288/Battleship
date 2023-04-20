import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Player } from '../utils/player';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    playerData!: Player;
    playerlist: Array<Player> = [];

    constructor(
        public afs: AngularFirestore,
        public afAuth: AngularFireAuth,
    ) {
        this.afAuth.authState.subscribe((user: any) => {
          if (user) {
            // localStorage.setItem('user', JSON.stringify(user));
            this.login(user.name, undefined, user.email, user.uid, false)
          }
        });
    }

    get user() {
        if (this.isLoggedIn) {
            return JSON.parse(localStorage.getItem('user')!);
        }
        throw new Error("No found uid");
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user')!);

        return user !== null
    }

    get nameLogged(): string {
        return this.isLoggedIn ? this.user.displayName : "";
    }

    setPlayers(players: Array<Player>) {
        if (this.isLoggedIn) {
            const loggedPlayer = JSON.parse(localStorage.getItem('user')!)
            this.playerlist = players.filter(a => a.uid != loggedPlayer.uid)
            this.playerData = players.find(a => a.uid == loggedPlayer.uid)!
        }
    }

    googleAuth() {
        return this.authLogin(new firebase.auth.GoogleAuthProvider())

    }

    anonimusLogin(name: string, password: string) {
        const uid = uuidv4()
        return this.login(name, password, undefined, uid, true)
    }

    login(name: string, password: string | undefined, email: string | undefined, uid: string, anonymous: boolean): any {
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password, uid, email, anonymous })
        }

        return fetch(`http://localhost:3001/game/user/login`, data)
        .then(res => { return res.json() })
        .then(data => {
            if (data.error) {
                return data
            }
            window.localStorage.setItem('user', JSON.stringify(data))
            return data 
        })
        .catch(error => { return error })
    }

    getInfo(token: string): any {
        const data = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
            },
        }

        return fetch(`http://localhost:3001/game/user`, data)
        .then(res => { return res.json() })
        .then(data => {
            console.log(data)
            
            if (data.error) {
                return data
            }
            window.localStorage.setItem('user', JSON.stringify(data))
            return data
        })
        .catch(error => { return error })
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
    }
}
