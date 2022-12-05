import { Injectable } from '@angular/core';
import {v4 as uuidv4} from 'uuid'
import { Match } from '../utils/match';
import { Player } from '../utils/player';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  matchData: Match | any;

  constructor() {}

  get match() {
    return JSON.parse(localStorage.getItem('match')!);
  }

  joinMatch(match: Match) {
    this.matchData = match
    localStorage.setItem('match', JSON.stringify(match))
  }

  leaveMatch() {
    localStorage.removeItem('match');
  }
}
