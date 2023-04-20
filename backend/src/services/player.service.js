const playerSchema = require('../schemas/player.schema')
const bcrypt = require('bcryptjs')

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