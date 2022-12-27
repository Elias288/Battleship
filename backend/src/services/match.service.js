const matchSchema = require('../schemas/match.schema')

const saveMatch = async (match) => {

    const newMatch = new matchSchema({
        matchId: match.id,
        players: match.players.map(p => p.id),
        winner: match.winner,
        points: match.winner.points,
    })

    return newMatch.save()
}

module.exports = {
    saveMatch
}