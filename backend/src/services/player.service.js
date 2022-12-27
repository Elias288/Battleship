const playerSchema = require('../schemas/player.schema')

const listPlayers = async () => {
    return await playerSchema.find({});
}

const savePlayer = async (name, uid/* , email */) => {
    const player = await findPlayer(name)
    if(player != null) return player

    const newPlayer = new playerSchema({
        uid,
        name,
        /* email, */
        score: 0,
    })

    return newPlayer.save()
}

const setScore = async (id, score, points, sum) => {
    let newScore = 0
    sum ? newScore = score += points
        : newScore = score - points > 0 
            ? score -= points 
            : 0

    await playerSchema.findByIdAndUpdate(id, { score: newScore }, { new: true })
}

const deletePlayer = (id) => {
    return playerSchema.findByIdAndDelete(id)
}

const findPlayer = (name) => {
    return playerSchema.findOne({name});
}

module.exports = {
    listPlayers,
    findPlayer,
    savePlayer,
    deletePlayer,
    setScore,
}