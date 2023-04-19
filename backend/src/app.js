const express = require('express')
const http = require('http')
// const { Server } = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const { author, license, name, description } = require('../package.json');
// require('./services/bd.service')

// const Player = require('./utils/player')
// const Game = require('./utils/game')

// const { savePlayer, setScore } = require('./services/player.service')
// const { saveMatch } = require('./services/match.service')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

// const game = new Game()

app.get('/', (req, res) => {
    res.send({ name, author, description, license })
})

// app.get('/game', (req, res) => {
// 	res.send(game)
// })
// app.get('/matches', (req, res) => {
// 	res.send(game.matches)
// })
// app.get('/match/:id', (req, res) => {
// 	res.send(game.getMatch(req.params.id))
// })

/*const whiteList = [ 'http://localhost:4200', '*' ]
const io = new Server(server, {
	cors: {
		origin: whiteList,
		methods: ['GET', 'POST']
	}
})
*/

module.exports = server