class Game {
    constructor() {
        this.players = []
        this.matches = []
    }

    addPlayer(player) {
        if (this.players.some(p => p.uid === player.uid)){
            return []
        }

        this.players.push(player)
        return this.players
    }

    getPlayerBySocketId(socketId){
        return this.players.find((player) => player.socketId === socketId)
    }

    getMatch(partyId) {
        return this.matches.find(party => party.id == partyId)
    }

    addToMatch(player, partyId) {
        const find = this.getMatch(partyId)
        const match = find != undefined ? find : new Match(partyId)
        if (find == undefined) {
            // console.log('create match')
            this.matches.push(match)
        }
        
        if (match.player1 == null) {
            match.setPlayer1(player)
            return match
        }
        if (match.player2 == null){
            match.setPlayer2(player)
            return match
        }
        
        return null
    }

    findMatch(playerId) {
        console.log(playerId)
        // console.log(this.matches)
        return this.matches.find(match => match.player1?.uid == playerId || match.player2?.uid == playerId)
    }

    removeToMatch(playerId) {
        const match = this.findMatch(playerId)
        console.log('match finded', match)
        if (match) {    
            match.player1?.uid == playerId ? match.player1 = null: match.player2 = null
            console.log(match)
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
        this.player1 = null
        this.player2 = null
    }

    setPlayer1(player){
        if (this.player1 != null) {
            return false
        }
        this.player1 = player
        return true
    }

    setPlayer2(player){
        if (this.player2 != null) {
            return false
        }
        this.player2 = player
        return true
    }
}

module.exports = Game