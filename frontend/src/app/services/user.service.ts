import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { Player } from '../utils/player';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  playerData: Player | undefined;
  playerlist: Array<Player> = [];

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
  ) {
    this.afAuth.authState.subscribe((user: any) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } /* else {
        localStorage.removeItem('user');
      } */
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
    
    return user !== null && user.emailVerified !== false ? true : false;
  }

  get nameLogged():string{
    return this.isLoggedIn? this.user.displayName:"";
  }

  setPlayers(players: Array<Player>) {
    if (this.isLoggedIn) {
      const loggedPlayer = JSON.parse(localStorage.getItem('user')!)
      this.playerlist = players.filter(a => a.uid != loggedPlayer.uid)
      this.playerData = players.find(a => a.uid == loggedPlayer.uid)
    }
  }

  googleAuth() {
    return this.authLogin(new firebase.auth.GoogleAuthProvider()).then((res: any) => {
      if (res) {
        window.location.href="/home";
      }
    });
  }

  anonimusLogin(name: string) {
    const uuid = uuidv4()
    localStorage.setItem('user', JSON.stringify(
      {
        displayName: name,
        uid: uuid,
        email: ""
      }
    ));
    window.location.href="/home";
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
      window.location.href="/";
    });
  }
}
