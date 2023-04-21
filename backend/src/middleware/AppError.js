class AppError extends Error {
    constructor(errorCode, message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode
    }
}

module.exports = AppError