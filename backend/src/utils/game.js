class Game {
    players = []
    constructor() {}

    addPlayer(player) {
        if (this.players.some(p => p.name === player.name)){
            return []
        }

        this.players.push(player)
        return this.players
    }

    getPlayer(socketId){
        return this.players.find((player) => player.socketId === socketId)
    }

    addToParty(player, partyId){

    }

    removePlayer (id) {
        const index = this.players.findIndex((player) => player.id === id )
        if (index !== -1) this.players.splice(index, 1)[0]
        return this.players
    }
}

module.exports = Game