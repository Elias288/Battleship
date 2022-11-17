import { Injectable } from '@angular/core';
import {v4 as uuidv4} from 'uuid'
import { Match } from '../utils/match';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  constructor() {}

  get match() {
    return JSON.parse(localStorage.getItem('match')!)
  }

  joinGame(match: Match) {
    localStorage.setItem('match', JSON.stringify(match))
  }

  leaveGame() {
    localStorage.removeItem('match');
  }
}
