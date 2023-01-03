const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const { author, license, name, description } = require('../package.json');
require('./services/bd.service')

const Player = require('./utils/player')
const Game = require('./utils/game')

const { savePlayer, setScore } = require('./services/player.service')
// const { saveMatch } = require('./services/match.service')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

const game = new Game()

app.get('/', (req, res) => {
    res.send({ name, author, description, license })
})

app.get('/game', (req, res) => {
	res.send(game)
})
app.get('/matches', (req, res) => {
	res.send(game.matches)
})
app.get('/match/:id', (req, res) => {
	res.send(game.getMatch(req.params.id))
})

const whiteList = [ 'http://localhost:4200', '*' ]
const io = new Server(server, {
	cors: {
		origin: whiteList,
		methods: ['GET', 'POST']
	}
})

io.on('connection', (socket) => {
	socket.on('join', (data) => join(data))
	socket.on('isConnected', () => isConnected())
	socket.on('addToMatch', (data) => addToMatch(data))
	socket.on('startGame', (matchId) => startGame(matchId))
	socket.on('attack', (info) => sendAttack(info))
	socket.on('hitStatus', (attack) => hitStatus(attack))
	
	socket.on('removeToMatch', (matchId) => removeToMatch(matchId))
	socket.on('leave', () => disconnect())
	socket.on('disconnect', () => disconnect())

	const join = async (data) => {
		const { name, uid, email } = data
		const savedPlayer = await savePlayer(name, uid, data.email);
		const newPlayer = new Player( socket.id, savedPlayer._id, savedPlayer.name, savedPlayer.score, uid, data.email)
		
		if (game.getPlayerByUid(newPlayer.uid)){
			socket.emit('error', 'join - User already register')
			return
		}
		const players = game.addPlayer(newPlayer)

		console.log('join', newPlayer.name);
		socket.emit('playerList', players)
		socket.broadcast.emit('playerList', players)
		socket.emit('joined', true)
	}
	const isConnected = () => {
		const isConnected = game.players.some(p => p.socketId == socket.id)
		socket.emit('isConnected', isConnected)
		// console.log('isConnected');
		return isConnected
	}
	const addToMatch = async (data) => {
		const { uid, matchId } = data
		if (matchId) {
			const res = game.addToMatch(socket.id, matchId)
			if (res == -1) {
				socket.emit('error', 'addToMatch - Match full')
				return
			}
			
			if (res == -2){
				socket.emit('error', 'addToMatch - User not found')
				return
			}
			
			console.log('addToMatch', matchId, res.players.map(p => p.name))
			socket.join(matchId)
			socket.emit('matches', res)
			socket.broadcast.to(matchId).emit('matches', res)
		}
		
	}
	const removeToMatch = async (matchId) => {
		const res = game.removeToMatch(socket.id, matchId)
		if (res == -1) {
			socket.emit('error', 'removeToMatch - Match not found')
			return
		}

		if (res == -2) {
			socket.emit('error', 'removeToMatch - User not found')
			return
		}

		if (res.players.length == 0) {
			game.deleteMatch(matchId)
		}

		console.log('removeToMatch');
		socket.emit('matches', res)
		socket.to(res.id).emit('matches', res)
	}

	const startGame = (matchId) => {
		const res = game.startGame(socket.id, matchId)
		
		if (res == -1) {
			socket.emit('error', 'startGame - Match not found')
			return
		}

		if (res == -2) {
			socket.emit('error', 'startGame - User not found')
			return
		}

		// console.log('startGame');
		socket.emit('matches', res)
		socket.broadcast.to(res.id).emit('matches', res)
	}
	const sendAttack = (info) => {
		// THE ATTACKER SENDS THE ATTACKED THE ATTACK POSITION, THE ATTACKER RESPONSES AND IS SAVED IN MATCH
		const {id, matchId} = info
		const res = game.sendAttack(id, socket.id, matchId)
		if (res == -2) {
			socket.emit('error', 'attack - User not found')
			return
		}
		
		if (res == -1) {
			socket.emit('error', 'startGame - Match not found')
			return
		}

		console.log('attack', 'to:', id);
		socket.broadcast.to(matchId).emit('attack', res)
	}
	const hitStatus = (attack) => {
		const { id, status, ownerId, matchId } = attack
		const res = game.getStatus(id, status, ownerId, socket.id, matchId)
		// THE ATTACKER SENDS THE ATTACKED THE ATTACK POSITION, THE ATTACKER RESPONSES AND IS SAVED IN MATCH
		
		if (res == -1) {
			socket.emit('error', 'startGame - Match not found')
			return
		}

		if (res == -2) {
			socket.emit('error', 'attack - User not found')
			return
		}

		console.log('hitResponse', status);
		socket.emit('matches', res)
		socket.broadcast.to(matchId).emit('matches', res)
	}
	const disconnect = () => {
		const player = game.getPlayerBySocketId(socket.id)
		if (!player) return

		const match = game.findMatchByPlayerUid(player.uid)
		if (match) {
			match.removePlayerFromMatch(player.uid)
			if (match.players.length == 0) {
				game.deleteMatch(match.id)
			}
			socket.to(match.id).emit('matches', match)
		}

		// console.log('disconnect');
		const players = game.removePlayer(player.uid)
		socket.broadcast.emit('playerList', players)
	}
})

module.exports = server