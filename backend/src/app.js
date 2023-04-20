require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const { author, license, name, description } = require('../package.json');
const userRoutes = require('./routes/user.routes')
const handleErrors = require('./middleware/handleErrors')
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

app.use('/api/user', userRoutes)

app.use(handleErrors)

module.exports = server