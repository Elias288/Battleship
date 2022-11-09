const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
    name: { type: String, required: true },
    score: Number,
    
}, { versionKey: false })

module.exports = mongoose.model('Players', playerSchema)