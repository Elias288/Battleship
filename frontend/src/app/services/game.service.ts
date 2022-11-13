import { Injectable } from '@angular/core';
import {v4 as uuidv4} from 'uuid'

@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  constructor() {}

  get match() {
    return JSON.parse(localStorage.getItem('match')!)
  }

  joinGame(match: any) {
    localStorage.setItem('match', JSON.stringify(match))
  }

  leaveGame() {
    localStorage.removeItem('match');
  }
}
