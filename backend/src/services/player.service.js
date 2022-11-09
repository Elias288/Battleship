const playerSchema = require('../schemas/player.schema')
const mongoose = require('mongoose')

const listPlayers = async () => {
    return await playerSchema.find({});
}

const createPlayer = async (name) => {
    const player = await playerSchema.findOne({ name })
    if(player) return { error: 'User already exists'}

    const newPlayer = new playerSchema({
        _id: new mongoose.Types.ObjectId(),
        name,
        score: 0,
    })
    return await newPlayer.save()
}

const setScore = async (id, score, sum) => {
    const player = await playerSchema.findById(id)
    if(!player){
        return { error: 'User not found' }
    }

    let newScore = 0
    sum ? newScore = player.score += score
        : newScore = player.score - score > 0 
            ? player.score -= score 
            : 0

    return await playerSchema.findByIdAndUpdate(player.id, {score:newScore}, {new: true})
}

const deletePlayer = async (id) => {
    return await playerSchema.findByIdAndDelete(id)
}

module.exports = {
    listPlayers,
    createPlayer,
    deletePlayer,
    setScore,
}