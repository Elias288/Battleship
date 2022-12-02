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

const setScore =  (id, score, sum) => {
    const player = playerSchema.findById(id)
    if(!player){
        return { error: 'User not found' }
    }

    let newScore = 0
    sum ? newScore = player.score += score
        : newScore = player.score - score > 0 
            ? player.score -= score 
            : 0

    playerSchema.findByIdAndUpdate(player.id, {score:newScore}, {new: true})
    return newScore
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