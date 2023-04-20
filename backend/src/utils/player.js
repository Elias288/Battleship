const {
    setScore,
} = require('../services/player.service')

class Player {
    cantShips = 17
    
    constructor(name, score, uid, email) {
        this.name = name
        this.score = score
        this.uid = uid
        this.email = email
        this.points = 0
        this.canStart = false
        this.canPutBoats = false
    }
    
    changeScore(score, plus) {
        this.score = setScore(score, plus)
    }

    changeCanStart(value) {
        this.canStart = value !== undefined ? value : !this.canStart
        return this.canStart
    }
    changeCanPutBoats(value) {
        this.canPutBoats = value !== undefined ? value : !this.canPutBoats
        return this.canPutBoats
    }
    destroyShip() {
        if (this.cantShips >= 0)
            this.cantShips--
    }
}

module.exports = Player