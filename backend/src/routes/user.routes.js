const bodyParser = require('body-parser')
const userCtrl = require('../controllers/user.controller')
const userRoutes = require('express').Router()

userRoutes.use(bodyParser.urlencoded({ extended: true }))
userRoutes.post('/login', userCtrl.login)
userRoutes.post('/create', userCtrl.createPlayer)
userRoutes.get('/', userCtrl.getUser)

module.exports = userRoutes
