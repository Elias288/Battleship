import { EventEmitter, Injectable } from '@angular/core';
import {v4 as uuidv4} from 'uuid'
import { Match } from '../utils/match';
import { Player } from '../utils/player';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  matchData: EventEmitter<Match> = new EventEmitter();

  constructor() {}

  get match() {
    return JSON.parse(localStorage.getItem('match')!);
  }

  joinMatch(match: Match) {
    localStorage.setItem('match', JSON.stringify(match))
    this.matchData.emit(match)
  }

  leaveMatch() {
    localStorage.removeItem('match');
  }
}
