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

/* TEMP */
app.get('/players', (req, res) => {
	res.send(game.players)
})
/* TEMP */
app.get('/matches', (req, res) => {
	res.send(game.matches)
})
/* TEMP */
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
	socket.on('leave', () => disconnect())
	socket.on('disconnect', () => disconnect())

	const join = async (data) => {
		console.log('join');
		const { name, uid/* , email */ } = data
		
		// DEVUELVE INFORMACIÓN EL JUGADOR DE LA BD, SI NO ESTÁ GUARDADO LO GUARDA
		const savedPlayer = await savePlayer(name, uid, /* data.email */);
		// CREA UNA NUEVA INSTANCIA DEL JUGADOR
		const newPlayer = new Player(
			socket.id,
			savedPlayer._id,
			savedPlayer.name,
			savedPlayer.score,
			uid,
			/* data.email */
		)
		// console.log(newPlayer.name, 'connected')

		// DEVUELVE LA LISTA DE JUGADORES, SI EL JUGADOR NO ESTÁ EN LA LISTA LO AGREGA.
		const players = game.addPlayer(newPlayer)
		
		if(game.players <= 0){
			socket.emit('error', '')
			console.log('error')
			return
		}
		socket.emit('playerList', players)
		socket.broadcast.emit('playerList', players)
		socket.emit('joined', '')
	}
	const isConnected = () => {
		console.log('isConnected');
		const isConnected = game.players.some(p => p.socketId == socket.id)
		// console.log(player)
		socket.emit('isConnected', isConnected)
		return isConnected
	}
	const addToMatch = async (data) => {
		console.log('addToMatch');
		const { uid, matchId } = data

		const match = game.addToMatch(uid, matchId)
		if (match == null) {
			socket.emit('error', 'match full')
			return
		}
		socket.join(matchId)
		match.isCanPutBoats()

		socket.emit('matches', match)
		socket.broadcast.to(matchId).emit('matches', match)
	}
	const removeToMatch = async () => {
		console.log('removeToMatch');
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
	const disconnect = () => {
		console.log('disconnect');
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
})

module.exports = server