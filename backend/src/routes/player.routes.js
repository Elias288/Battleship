const bodyParser = require('body-parser')
const playerCtrl = require('../controllers/player.controller')
const { verifyToken } = require('../middleware/verifyToken')
const playerRoutes = require('express').Router()

playerRoutes.use(bodyParser.urlencoded({ extended: true }))

playerRoutes.post('/', playerCtrl.create)
playerRoutes.post('/login', playerCtrl.login)
playerRoutes.get('/me', verifyToken, playerCtrl.getPlayer)
playerRoutes.get('/existPlayer/:username', playerCtrl.existPlayer)

module.exports = playerRoutes
