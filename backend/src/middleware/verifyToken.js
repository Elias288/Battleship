const jwt = require('jsonwebtoken')
const AppError = require('./AppError')

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']
        
        if (!token) throw new AppError('Token es requerido', 400)
        if (!token.toLowerCase().startsWith('bearer')) throw new AppError('Acceso denegado', 401)

        const subToken = token.substring(7)
        req.tokenData = jwt.verify(subToken, process.env.TOKEN_SECRET)

        return next()
    } catch (error) {
        // console.log(error);
        return next(error)
    }
}