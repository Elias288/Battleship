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
    res.send({
		name,
		author,
		description,
		license, 
	})
})

const whiteList = [ 'http://localhost:4200', '*' ]
const io = new Server(server, {
	cors: {
		origin: whiteList,
		methods: ['GET', 'POST']
	}
})

io.on('connection', (socket) => {
	socket.on('join', (data) => join(socket, data))

	socket.on('isConnected', () => isConnected(socket))

	socket.on('addToMatch', (data) => addToMatch(socket, data))

	socket.on('removeToMatch', () => removeToMatch(socket))

	socket.on('leave', () => disconnect(socket))

	socket.on('disconnect', () => disconnect(socket))
})

const join = async (socket, data) => {
	const name = data.name.toLowerCase()
	let savedPlayer = await savePlayer(name, data.uid, data.email);
	if (savedPlayer == null) {
		savedPlayer = await findPlayer(name)
	}
	const newPlayer = new Player(
		socket.id,
		savedPlayer._id,
		savedPlayer.name,
		savedPlayer.score,
		data.uid,
		data.email
	)
	const players = game.addPlayer(newPlayer)
	socket.emit('playerList', players)
	socket.broadcast.emit('playerList', players)
	socket.emit('isConnected', true)
}

const isConnected = (socket) => {
	const isConnected = game.players.some(p => p.socketId == socket.id)
	// console.log(player)
	socket.emit('isConnected', isConnected)
}

const addToMatch = async (socket, data) => {
	const match = game.addToMatch(data.uid, data.matchId)
	if (match == null) {
		socket.emit('error', 'match full')
		return
	}
	socket.join(data.matchId)
	socket.emit('connectedToMatch', match)
	socket.broadcast.to(data.matchId).emit('connectedToMatch', match)
}

const removeToMatch = async (socket) => {
	const player = game.getPlayerBySocketId(socket.id)
	if (!player) {
		socket.emit('error', 'User not found')
		return
	}
	const match = game.removeToMatch(player.uid)
	if (!match) {
		socket.emit('error', 'match not found')
		return
	}
	socket.emit('matches', match)
	socket.to(match.id).emit('matches', match)
}

const disconnect = (socket) => {
	const player = game.getPlayerBySocketId(socket.id)
	
	if (player != null) {
		// console.log(player.name, 'disconnected')
		const match = game.removeToMatch(player.uid)
		if (match) socket.to(match.id).emit('matches', match)

		const players = game.removePlayer(player.id)
		socket.broadcast.emit('playerList', players)

		// const messageData = new Msg(user.room, 'system', `${user.name} has left`)
		// send(socket, true, user.room, 'receiveMessage', messageData)
	}
	
}

module.exports = server