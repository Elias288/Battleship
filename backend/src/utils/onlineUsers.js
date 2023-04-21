class Onlineplayers {
    players = []

    constructor(){}

    addNewplayer (playerId, email, username, socketId, guest) {
        if (this.players.some(player => player.playername === username && player.email === email)) {
            return {
                isError: true,
                details: 'Usuario ya conectado',
                statusCode: 401,
            }
        }
        
        this.players.push({ playerId, email, username, socketId, guest })
        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario agregado: [${playerId}][${socketId}][${guest}]`);
        return { isError: false }
    }

    getPlayerBySocket(socketId) {
        return this.players.find(player => player.socketId === socketId)
    }

    getPlayerById(id) {
        return this.players.find(player => player.playerId === id)
    }

    getAllPlayers () {
        return this.players
    }

    removePlayer(socketId) {
        this.players = this.players.filter((player) => player.socketId !== socketId)

        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario eliminado: [${socketId}]`);
    }
}

module.exports = Onlineplayers