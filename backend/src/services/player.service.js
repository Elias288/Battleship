const playerSchema = require('../schemas/player.schema')
const bcrypt = require('bcryptjs')

const listPlayers = async () => {
    return await playerSchema.find({});
}

const savePlayer = async (name, uid, email) => {
    const player = await findPlayerByUid(uid)
    if(player) return player

    const newPlayer = new playerSchema({
        uid,
        name,
        email,
        score: 0,
    })

    return newPlayer.save()
}

const saveAnonimPlayer = async (name, uid, password) => {
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
    getPlayerByUid,
    getPlayerByName,
    savePlayer,
    saveAnonimPlayer,
    deletePlayer,
    setScore,
}