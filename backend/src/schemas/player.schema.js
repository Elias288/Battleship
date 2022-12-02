const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
    uid: String,
    name: { type: String, required: true },
    // email: { type: String, required: true},
    score: Number,
    
}, { versionKey: false })

module.exports = mongoose.model('Players', playerSchema)