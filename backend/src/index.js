require('dotenv').config()
const app = require('./app')
const sockets = require('./sockets')
const http = require('http')
const { Server: WebsocketServer } = require('socket.io')

const PORT = process.env.PORT || 3000

const server = http.createServer(app),
httpServer = app.listen(PORT, () => {
	console.log(`escuchando en *${PORT}`)
})

const whiteList = [ 'http://localhost:4200', '*' ]
const io = new WebsocketServer(httpServer, { cors: { origin: whiteList } })
sockets(io)