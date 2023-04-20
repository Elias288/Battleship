const playerSchema = require('../schemas/player.schema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.savePlayer = async (name, email, password) => {
    const player = await playerSchema.findOne({ $or: [ { username: name }, { email } ] }).exec()
    if (player) return {
        isError: true,
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
            details: err,
            statusCode: 500,
        }
    })
}

exports.login = async (username, email, password) => {
    const player = await playerSchema.findOne({ $or: [ { username }, { email } ] }).exec()
    if (!player) return {
        isError: true,
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
            details: 'Usuario o contraseña invalida',
            statusCode: 400,
        }
    }
}

/* const saveAnonimPlayer = async (name, uid, password) => {
    const hashedPassword = await bcrypt.hashSync(password, 8)
    const player = await findPlayerByName(name)
    
    if (player) {
        if (await bcrypt.compare(password, player.password)) {
            return player
        } else {
            return -1
        }
    } 

    const newPlayer = new playerSchema({
        uid,
        name,
        score: 0,
        password: hashedPassword,
    })
    return newPlayer.save()
}

exports.listPlayers = async () => {
    return await playerSchema.find({})
}

const setScore = async (id, score, points, sum) => {
    let newScore = 0
    if (sum) {
        newScore = score += points
    } else {
        newScore = score - points > 0 ? score -= point : 0
    }

    await playerSchema.findByIdAndUpdate(id, { score: newScore }, { new: true })
}

const deletePlayer = (id) => {
    return playerSchema.findByIdAndDelete(id)
}

const getPlayerByUid = (uid) => {
    return playerSchema.findOne({ uid });
}

const getPlayerByName = (name) => {
    return playerSchema.findOne({ name });
}


module.exports = {
    listPlayers,
    savePlayer,
    getPlayerByUid,
    getPlayerByName,
    saveAnonimPlayer,
    deletePlayer,
    setScore,
} */