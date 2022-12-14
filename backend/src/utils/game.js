const Match = require('./match')

class Game {
    constructor() {
        this.players = []
        this.matches = []
    }

    addPlayer(player) {
        this.players.push(player)
        return this.players
    }

    getPlayerBySocketId(socketId){
        return this.players.find((player) => player.socketId == socketId)
    }

    getPlayerByUid(uid) {
        return this.players.find((player) => player.uid == uid)
    }

    getMatchById(partyId) {
        return this.matches.find(party => party.id == partyId)
    }

    addMatch(partyId) {
        const match = new Match(partyId)
        this.matches.push(match)
        return match
    }

    findMatchByPlayerUid(playerUid) {
        return this.matches.find(m => m.players.some(p => p.uid == playerUid))
    }

    deleteMatch(matchId) {
        const index = this.matches.findIndex((match) => match.id === matchId )
        if (index !== -1) this.matches.splice(index, 1)[0]
        return this.matches
    }

    removePlayer (id) {
        const index = this.players.findIndex((player) => player.id === id )
        if (index !== -1) this.players.splice(index, 1)[0]
        return this.players
    }
}

module.exports = Game