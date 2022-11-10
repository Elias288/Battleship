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
const { savePlayer } = require('./services/player.service')

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
	socket.on('leave', () => disconnect(socket))
	socket.on('disconnect', () => disconnect(socket))
})

const join = async (socket, data) => {
	const newPlayer = new Player(socket.id, await savePlayer(data.name.toLowerCase()))
	console.log(newPlayer.name.toLowerCase(), 'connected')
	// console.log(newPlayer)

	const players = game.addPlayer(newPlayer)
	if(players.length == 0){
		send(socket, false, '', 'error', 'User already registered')
		return
	}

	send(socket, false, '', 'playerList', players/* .filter(player => player.socketId != socket.id) */)
	send(socket, true, '', 'playerList', players)
}

const disconnect = (socket) => {
	const player = game.getPlayer(socket.id)
	if (player != null) {
		console.log(player.name, 'disconnected')
		const players = game.removePlayer(player.id)
		// const messageData = new Msg(user.room, 'system', `${user.name} has left`)
		// send(socket, true, user.room, 'receiveMessage', messageData)
		send(socket, true, '', 'playerList', players)
	}
	
}

const send = (socket, broadcast, room, direction, message) => {
	broadcast 
		? room !== '' 
			? socket.broadcast.to(room).emit(direction, message) 
			: socket.broadcast.emit(direction, message)
		: room !== '' 
			? socket.to(room).emit(direction, message) 
			: socket.emit(direction, message)
}

module.exports = server