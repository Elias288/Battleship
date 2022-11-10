const {
    setScore,
    savePlayer,
} = require('../services/player.service')

class Player {
    cantShips = 5
    
    constructor(socketId, player) {
        this.socketId = socketId
        this.id = player._id
        this.name = player.name
        this.score = player.score
    }
    
    changeScore(score, plus) {
        this.score = setScore(score, plus)
    }
}

module.exports = Player