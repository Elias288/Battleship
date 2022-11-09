const express = require('express')
const http = require('http')
// const { Server } = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
const { listPlayers, createPlayer, deletePlayer, setScore } = require('./services/player.service')
const { author, license, name, description } = require('../package.json');
require('dotenv').config()
require('./services/bd.service')

const app = express()

app.use(cors())
// const server = http.createServer(app)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send({
		name,
		author,
		description,
		license, 
	})
})

// const whiteList = [ 'http://localhost:4200', '*' ]
// const io = new Server(server, {
// 	cors: {
// 		origin: whiteList,
// 		methods: ['GET', 'POST']
// 	}
// })

// io.on('connection', (socket) => {
//     console.log(data)
// })

module.exports = app