class Match {
    constructor(id){
        this.id = id
        this.fieldSize = 10
        this.turn = undefined
        this.winner = undefined
        this.players = []
        this.attacks = []
    }

    addPlayerToMatch(player) {
        if (this.players.length <= 2) {
            player.changeCanPutBoats(true)
            this.players.push(player)
        }
    }

    removePlayerFromMatch(playerUid){
        const newPlayers = this.players.filter(player => {
            return player.uid != playerUid
        })
        
        this.players = newPlayers

        if (this.players.length > 0) {
            this.attacks = []
            this.turn = undefined
            this.players[0].canPutBoats = true
            this.players[0].canStart = false
        }
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

    changeTurn() {
        if (this.players.length == 2) {
            const otherPlayer = this.players.find(p => p.uid != this.turn)
            // console.log(otherPlayer.name)
            this.turn = otherPlayer.uid
        }
    }

    addAttack(position, ownerId, status) {
        const newAttack = new Attack(position, ownerId, status)
        this.attacks.push(newAttack)
    }
}

class Attack {
    constructor(id, ownerId, status) {
        this.id = id
        this.status = status
        this.owner = ownerId
    }
}

module.exports = Match