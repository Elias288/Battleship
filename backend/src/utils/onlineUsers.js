class OnlineUsers {
    users = []

    constructor(){}

    addNewUser (userId, email, username, socketId, guest) {
        !this.users.some(user => user.email === email || user.userId === userId | user.username === username) && 
        this.users.push({ userId, email, username, socketId, guest })

        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario agregado: [${userId}][${socketId}][${guest}]`);
    }

    getUserBySocket(socketId) {
        return this.users.find(user => user.socketId === socketId)
    }

    getUserById(id) {
        return this.users.find(user => user.userId === id)
    }

    getAllUsers () {
        return this.users
    }

    removeUser(socketId) {
        this.users = this.users.filter((user) => user.socketId !== socketId)

        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario eliminado: [${socketId}]`);
    }
}

module.exports = OnlineUsers