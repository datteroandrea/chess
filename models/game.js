const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        unique: true,
        required: true
    },
    whitePlayerId: {
        type: String,
        unique: true
    },
    blackPlayerId: {
        type: String,
        unique: true
    },
    pgn: {
        type: [],
        required: true
    },
    winnerId: {
        type: String
    },
    isStarted: { // indica se la partita è iniziata
        type: Boolean,
        required: true,
        default: false
    },
    isRated: { // utilizzato per definire anche partite con o senza rating
        type: Boolean,
        required: true,
        default: true
    },
    timeLimit: {
        type: Number,
        required: true,
        default: 20
    }
});

mongoose.pluralize(null);
const model = mongoose.model('Game', gameSchema);

module.exports = model;