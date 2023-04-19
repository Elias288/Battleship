const Match = require('./match')
const Player = require('./player')
const { saveMatch } = require('../services/match.service')
const { setScore, findPlayerByName, savePlayer } = require('../services/player.service')
var bcrypt = require('bcryptjs');

class Game {
    constructor() {
        this.players = []
        this.matches = []
    }

    addPlayer(player) {
        this.players.push(player)
        return this.players
    }

    async join(newPlayer) {
        // const findedPlayer = await findPlayerByName(name)
        // let newPlayer

        // if (findedPlayer) {
        //     if (hashedPassword) {
        //         bcrypt.compare(hashedPassword, findedPlayer.password).then(res => {
        //             console.log(res);
        //         })
        //         return
        //     }

        //     newPlayer = new Player(socketId, findedPlayer.name, findedPlayer.score, findedPlayer.uid, findedPlayer.email)
        //     this.addPlayer(newPlayer)
        //     return this.players
        // }
        
        // // IF ANONIMUS LOGIN
        // if (hashedPassword) {
        //     newPlayer = new Player(socketId, name, 0, uid, null)
        // } 
        
        // // IF GOOGLE LOGIN
        // if (email) {
        //     newPlayer = new Player(socketId, name, 0, uid, email)
        // }
        
        this.addPlayer(newPlayer)
        // savePlayer(newPlayer.name, newPlayer.uid, newPlayer.email, hashedPassword)
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
        const isMatch = this.getMatchById(partyId)
        if (isMatch) {
            return isMatch
        }
        const match = new Match(partyId)
        this.matches.push(match)
        return match
    }

    findMatchByPlayerUid(playerUid) {
        return this.matches.find(match => match.players.some(player => player.uid === playerUid))
    }

    deleteMatch(matchId) {
        const index = this.matches.findIndex((match) => match.id === matchId )
        if (index !== -1) this.matches.splice(index, 1)[0]
        return this.matches
    }

    removePlayer (playerUid) {
        const index = this.players.findIndex((player) => player.uid === playerUid )
        if (index !== -1) this.players.splice(index, 1)[0]
        return this.players
    }

    addToMatch(socketId, matchId){
        const match = this.addMatch(matchId)
        if (match.players.length == 2) return -1
        
        const player = this.getPlayerBySocketId(socketId)
        if (!player) return -2

        match.addPlayerToMatch(player)
        return match
    }

    removeToMatch(socketId, matchId){
        const match = this.getMatchById(matchId)
        if (!match) return -1

        const player = this.getPlayerBySocketId(socketId)
        if (!player) return -2

		player.changeCanStart(false)
		player.changeCanPutBoats(true)
        match.removePlayerFromMatch(player.uid)

        return match
    }

    sendAttack(position, socketId, matchId){
        const match = this.getMatchById(matchId)
        if (!match) return -1

        const player = this.getPlayerBySocketId(socketId)
        if (!player) return -2

        return { id: position, owner: player.uid }
    }

    getStatus(position, status, ownerId, socketId, matchId){
        const match = this.getMatchById(matchId)
        if (!match) return -1

        const player = this.getPlayerBySocketId(socketId)
        if (!player) return -2

        const enemy = match.players.find(p => p.uid !== player.uid)
		if (status) {
			player.destroyShip()
			enemy.points = enemy.points + 1
		}
		match.addAttack(position, ownerId, status) 

        if (player.cantShips == 0) {
			match.turn = undefined
			match.winner = enemy.id
			
			setScore(enemy.id, enemy.score, enemy.points, true)
			enemy.score = enemy.score += enemy.points

			// SAVE MATCH
			saveMatch(match)
		}

        match.changeTurn()

        return match
    }

    startGame(socketId, matchId){
        const match = this.getMatchById(matchId)
        if (!match) return -1

        const player = this.getPlayerBySocketId(socketId)
        if (!player) return -2

        player.changeCanStart(true)
		player.changeCanPutBoats(false)
		const canStart = match.isCanStart()
		
		if (canStart) {
			match.setFirstTurn()
		}

        return match
    }
}

module.exports = Game