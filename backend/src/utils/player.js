const {
    setScore,
    savePlayer,
} = require('../services/player.service')

class Player {
    cantShips = 5
    
    constructor(socketId, id, name, score, uid, email) {
        this.socketId = socketId
        this.id = id
        this.name = name
        this.score = score
        this.uid = uid
        this.email = email
    }
    
    changeScore(score, plus) {
        this.score = setScore(score, plus)
    }
}

module.exports = Player