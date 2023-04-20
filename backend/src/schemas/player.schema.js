const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    score: Number,
    
}, { versionKey: false })

module.exports = mongoose.model('Players', playerSchema)