const { Schema, model } = require('mongoose')

const matchSchema = new Schema({
    id: String,
    players: [
        { type: Schema.Types.ObjectId, ref: 'Player' }
    ],
    winner: { type: Schema.Types.ObjectId, ref: 'Player' },
    points: Number
    
}, { versionKey: false })

module.exports = model('Match', matchSchema)