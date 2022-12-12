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

class Match {
    constructor(id){
        this.id = id
        this.fieldSize = 10
        this.players = []
        this.turn = undefined
    }

    addPlayerToMatch(player) {
        if (this.players.length <= 2) {
            player.changeCanPutBoats(true)
            this.players.push(player)
        }
    }

    removePlayerFromMatch(playerUid){
        const player = this.players.findIndex(p => p.uid == playerUid)
        if (player !== -1) this.players.splice(player, 1)[0]
    }

    findPlayer(playerUid) {
        return this.players.find(p => p?.uid == playerUid)
    }

    isCanStart() {
        if (this.players.length == 2) {
            return this.players[0].canStart && this.players[1].canStart
        }
        this.turn = undefined
        return false
    }

    setFirstTurn() {
        const randomValue = Math.floor(Math.random() * 2)
        this.turn = this.players[randomValue].uid
    }

    changeTurn(playerUid) {
        if (this.turn == playerUid) {
            const otherPlayer = this.players.find(p => p.uid != this.turn)
            this.turn = otherPlayer.uid
        }
    }
}

module.exports = Game