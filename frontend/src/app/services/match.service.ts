import { Injectable } from '@angular/core';
import {v4 as uuidv4} from 'uuid'
import { Match } from '../utils/match';
import { Player } from '../utils/player';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  match: Match | any;

  constructor() {}

  joinMatch(match: Match) {
    localStorage.setItem('match', JSON.stringify(match))
  }

  setMatch(match: Match) {
    this.match = match
  }

  leaveMatch() {
    localStorage.removeItem('match');
  }
}
