const OnlineUsers = require('./utils/onlineUsers')

const onlineUsers = new OnlineUsers()

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('client:join', async (data) => {
            const { userId, username, email, guest } = data
            onlineUsers.addNewUser(userId, email, username, socket.id, guest)

            emitOnlineUsers()
        })
        
        socket.on('disconnect', () => {
            onlineUsers.removeUser(socket.id)
            emitOnlineUsers()
        })

        const emitOnlineUsers = () => {
            io.emit('server:onlineUsers', onlineUsers.getAllUsers())
        }

        /* socket.on('join', (data) => join(data))
        socket.on('isConnected', () => isConnected())
        socket.on('addToMatch', (data) => addToMatch(data))
        socket.on('startGame', () => startGame())
        socket.on('attack', (id) => sendAttack(id))
        socket.on('hitStatus', (attack) => hitStatus(attack))
        
        socket.on('removeToMatch', () => removeToMatch())
        socket.on('leave', () => disconnect())
        socket.on('disconnect', () => disconnect())
    
        const join = async (data) => {
            const { name, uid, email } = data
            const savedPlayer = await savePlayer(name, uid, data.email);
            const newPlayer = new Player( socket.id, savedPlayer._id, savedPlayer.name, savedPlayer.score, uid, data.email)
            
            if (game.getPlayerByUid(newPlayer.uid)){
                socket.emit('error', 'join - User already register')
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
            if (match.players.length == 0) {
                game.deleteMatch(match.id)
            }
    
            // console.log('removeToMatch');
            socket.emit('matches', match)
            socket.to(match.id).emit('matches', match)
        }
        const sendAttack = (id) => {
            // THE ATTACKER SENDS THE ATTACKED THE ATTACK POSITION, THE ATTACKER RESPONSES AND IS SAVED IN MATCH
            const player = game.getPlayerBySocketId(socket.id)
            if (!player) {
                socket.emit('error', 'attack - User not found')
                return
            }
            const match = game.findMatchByPlayerUid(player.uid)
            if (!match) {
                socket.emit('error', 'startGame - Match not found')
                return
            }
    
            // console.log('attack from:', player.name ,'to:', id);
            socket.broadcast.to(match.id).emit('attack', {id, owner: player.uid})
        }
        const hitStatus = (attack) => {
            const {id, status, ownerId} = attack
            // THE ATTACKER SENDS THE ATTACKED THE ATTACK POSITION, THE ATTACKER RESPONSES AND IS SAVED IN MATCH
            const player = game.getPlayerBySocketId(socket.id)
            if (!player) {
                socket.emit('error', 'attack - User not found')
                return
            }
            const match = game.findMatchByPlayerUid(player.uid)
            if (!match) {
                socket.emit('error', 'startGame - Match not found')
                return
            }
            
            const enemy = match.players.find(p => p.uid !== player.uid)
            if (status) {
                player.destroyShip()
                enemy.points = enemy.points + 1
            }
            match.addAttack(id, ownerId, status)
    
            if (player.cantShips == 0) {
                match.turn = undefined
                match.winner = enemy.id
                
                setScore(enemy.id, enemy.score, enemy.points, true)
                enemy.score = enemy.score += enemy.points
    
                // SAVE MATCH
                saveMatch(match)
            }
    
            match.changeTurn()
    
            // console.log('hitResponse', status);
            socket.emit('matches', match)
            socket.broadcast.to(match.id).emit('matches', match)
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
        const disconnect = () => {
            const player = game.getPlayerBySocketId(socket.id)
            if (!player) return
    
            const match = game.findMatchByPlayerUid(player.uid)
            if (match) {
                match.removePlayerFromMatch(player.uid)
                if (match.players.length == 0) {
                    game.deleteMatch(match.id)
                }
                socket.to(match.id).emit('matches', match)
            }
    
            // console.log('disconnect');
            const players = game.removePlayer(player.uid)
            socket.broadcast.emit('playerList', players) 
        } */
    })
}