class Game {
    constructor() {
        this.players = []
        this.matches = []
    }

    addPlayer(player) {
        if (this.players.length == 0 || this.players.some(p => p.uid != player.uid)){
            this.players.push(player)
        }

        return this.players
    }

    getPlayerBySocketId(socketId){
        return this.players.find((player) => player.socketId == socketId)
    }

    getPlayerByUid(uid) {
        return this.players.find((player) => player.uid == uid)
    }

    getMatch(partyId) {
        return this.matches.find(party => party.id == partyId)
    }

    addToMatch(uid, partyId) {
        const find = this.getMatch(partyId)
        const match = find != undefined ? find : new Match(partyId)
        if (find == undefined) {
            this.matches.push(match)
        }
        const player = this.getPlayerByUid(uid)

        if (!match.isPlayer1()) {
            match.setPlayer1(player)
            return match
        }
        
        if (!match.isPlayer2()) {
            match.setPlayer2(player)
            return match
        }

        return null
    }

    findMatchByPlayerId(playerId) {
        return this.matches.find(match => 
            match?.player1?.uid == playerId || match?.player2?.uid == playerId
        )
    }

    removeToMatch(playerId) {
        const match = this.findMatchByPlayerId(playerId)
        if (match) {    
            match.removePlayerFromMatch(playerId)
            match.isCanPutBoats()
        }        
        return match
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
        this.player1 = undefined
        this.player2 = undefined
        this.canPutBoats = false
        this.canStart = false
    }

    isPlayer1() { // return false if undefined
        return this.player1 != undefined
    }

    isPlayer2() { // return false if undefined
        return this.player2 != undefined
    }

    setPlayer1(player){
        this.player1 = player
    }

    setPlayer2(player){
        this.player2 = player
    }

    removePlayerFromMatch(player_uid) {
        if (player_uid == this.player1.uid) {
            this.player1 = this.player2
        }
        this.player2 = undefined
        return
    }

    isCanPutBoats() {
        this.canPutBoats = this.isPlayer1() && this.isPlayer2()
        return this.canPutBoats
    }

    isCanStart() {
        this.canStart = this.isPlayer1() && this.isPlayer2()
        return this.canStart
    }
}

module.exports = Game