const playerSchema = require('../schemas/player.schema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { ALREADY_CREATE, SERVER_ERROR, MISSING_DATA, INVALID_DATA, INFO_NOT_FOUND } = require('../middleware/errorCodes')

exports.savePlayer = async (name, email, password) => {
    const player = await playerSchema.findOne({ $or: [ { username: name }, { email } ] }).exec()
    if (player) return {
        isError: true,
        errorCode: ALREADY_CREATE,
        details: `Usuario ya registrado`,
        statusCode: 400,
    }
    
    const hashedPassword = bcrypt.hashSync(password, 8)
    const newPlayer = new playerSchema({
        username: name,
        email,
        password: hashedPassword,
        score: 0,
    })

    return newPlayer.save().then((user) => {
        return { isError: false,  user}
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.login = async (username, email, password) => {
    const player = await playerSchema.findOne({ $or: [ { username }, { email } ] }).exec()
    if (!player) return {
        isError: true,
        errorCode: INFO_NOT_FOUND,
        details: 'Usuario no encontrado',
        statusCode: 404,
    }

    if (await bcrypt.compare(password, player.password)) {
        const tokenData = { id: player._id, username: player.username, email: player.email }
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: 43200 }) // EXPIRA EN 12 HORAS CADA VEZ QUE SE LOGUEA
        return { jwt: token }
    } else {
        return {
            isError: true,
            errorCode: INVALID_DATA,
            details: 'Usuario o contraseña invalida',
            statusCode: 400,
        }
    }
}

exports.deletePlayer = async (id) => {
    if (!id) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: 'Id es necesaria',
        statusCode: 404,
    }

    try {
        const data = await playerSchema.findByIdAndDelete(id)
        if (!data) return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: `Usuario no encontrado [${id}]`,
            statusCode: 404,
        }

        return data
    } catch (error) {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: error,
            statusCode: 500,
        }
    }
}

exports.getPlayerByid = async (id) => {
    if (!id) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: 'Id es necesaria',
        statusCode: 404,
    }

    try {
        const data = await playerSchema.findById(id);
        if (!data) return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: `Usuario no encontrado [${id}]`,
            statusCode: 404,
        }

        return data
    } catch (error) {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: error,
            statusCode: 500,
        }
    }
}

exports.getPlayerByUsername = async (username) => {
    if (!username) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: 'username es necesario',
        statusCode: 404,
    }

    try {
        const data = await playerSchema.findOne({ username });
        if (!data) return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: `Usuario no encontrado [${username}]`,
            statusCode: 404,
        }

        return data
    } catch (error) {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: error,
            statusCode: 500,
        }
    }
}

/* 
const setScore = async (id, score, points, sum) => {
    let newScore = 0
    if (sum) {
        newScore = score += points
    } else {
        newScore = score - points > 0 ? score -= point : 0
    }

    await playerSchema.findByIdAndUpdate(id, { score: newScore }, { new: true })
}
*/