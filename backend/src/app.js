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
const { savePlayer, findPlayer } = require('./services/player.service')

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
	socket.on('removeToMatch', () => removeToMatch())
	socket.on('startGame', () => startGame())
	socket.on('changeTurn', () => passTurn())
	socket.on('leave', () => disconnect())
	socket.on('disconnect', () => disconnect())

	const join = async (data) => {
		const { name, uid/* , email */ } = data
		const savedPlayer = await savePlayer(name, uid, /* data.email */);
		const newPlayer = new Player( socket.id, savedPlayer._id, savedPlayer.name, savedPlayer.score, uid, /* data.email */)
		
		if (game.getPlayerByUid(newPlayer.uid)){
			socket.emit('error', 'join - User already register')
			// console.log('error')
			return
		}
		const players = game.addPlayer(newPlayer)

		// console.log('join');
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
		
		let match = game.getMatchById(matchId)
		if (match == undefined) {
			match = game.addMatch(matchId)
		}
		if (match.players.length == 2) {
			socket.emit('error', 'addToMatch - Match full')
			return
		}
		const player = game.getPlayerByUid(uid)
		if (!player) {
			socket.emit('error', 'addToMatch - User not found')
			return
		}
		match.addPlayerToMatch(player)
		// match.isCanPutBoats()

		// console.log('addToMatch')
		socket.join(matchId)
		socket.emit('matches', match)
		socket.broadcast.to(matchId).emit('matches', match)
	}
	const removeToMatch = async () => {
		const player = game.getPlayerBySocketId(socket.id)
		if (!player) {
			socket.emit('error', 'removeToMatch - User not found')
			return
		}
		const match = game.findMatchByPlayerUid(player.uid)
		if (!match) {
			socket.emit('error', 'removeToMatch - Match not found')
			return
		}
		match.removePlayerFromMatch(player.uid)
		// match.isCanPutBoats()
		if (match.players.length == 0) {
			game.deleteMatch(match.id)
		}
		// console.log('removeToMatch');
		socket.emit('matches', match)
		socket.to(match.id).emit('matches', match)
	}
	const startGame = () => {
		const player = game.getPlayerBySocketId(socket.id)
		if (!player) {
			socket.emit('error', 'startGame - User not found')
			return
		}
		const match = game.findMatchByPlayerUid(player.uid)
		if (!match) {
			socket.emit('error', 'startGame - Match not found')
			return
		}
		player.changeCanStart(true)
		player.changeCanPutBoats(false)
		const canStart = match.isCanStart()
		
		if (canStart) {
			match.setFirstTurn()
		}

		// console.log('startGame');
		socket.emit('matches', match)
		socket.broadcast.to(match.id).emit('matches', match)
	}
	const passTurn = () => {
		const player = game.getPlayerBySocketId(socket.id)
		if (!player) {
			socket.emit('error', 'startGame - User not found')
			return
		}
		const match = game.findMatchByPlayerUid(player.uid)
		if (!match) {
			socket.emit('error', 'startGame - Match not found')
			return
		}

		if (!match.isCanStart()) {
			return
		}

		// console.log('passTurn')
		match.changeTurn(player.uid)
		socket.emit('matches', match)
		socket.broadcast.to(match.id).emit('matches', match)
	}
	const disconnect = () => {
		const player = game.getPlayerBySocketId(socket.id)
		
		if (player != null) {
			const match = game.findMatchByPlayerUid(player.uid)
			player.changeCanPutBoats(false)
			if (match){
				match.removePlayerFromMatch(player.uid)
				// match.isCanPutBoats()
				if (match.players.length == 0) {
					game.deleteMatch(match.id)
				}
				socket.to(match.id).emit('matches', match)
			}
			
			// console.log('disconnect');
			const players = game.removePlayer(player.id)
			socket.broadcast.emit('playerList', players)
		}
		
	}
})

module.exports = server