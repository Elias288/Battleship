const {
    setScore,
    savePlayer,
} = require('../services/player.service')
const Field = require('./field')

class Player {
    cantShips = 5
    
    constructor(socketId, id, name, score, uid/* , email */) {
        this.socketId = socketId
        this.id = id
        this.name = name
        this.score = score
        this.uid = uid
        /* this.email = email */
        this.points = 0
        this.field = new Field(25, 25)
    }
    
    changeScore(score, plus) {
        this.score = setScore(score, plus)
    }
}

module.exports = Player