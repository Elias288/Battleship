const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
    uid: String,
    name: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: false },
    score: Number,
    
}, { versionKey: false })

module.exports = mongoose.model('Players', playerSchema)