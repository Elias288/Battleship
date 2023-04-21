const AppError = require("./AppError");

const handleSocketErrors = (error, socket) => {
    console.error(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}]`, error);
    
    if (error instanceof AppError) {
        return socket.emit('server:error', { errorMessage: error.message })
    }
    
    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(socket, error)
}

const ERROR_HANDLERS = {
    defaultError: (socket) => socket.emit('server:error', { errorMessage: 'Something went wrong' })
}

module.exports = handleSocketErrors
