const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema({
    tournamentId: {
        type: String,
        unique: true,
        required: true
    },
    games: { // lista degli id delle partite giocate
        type: [],
        default: []
    },
    hasEnded: {
        type: Boolean,
        default: false
    },
    winnerId: {
        type: String,
        default: ""
    },
    hasStarted: { // indica se la partita è iniziata
        type: Boolean,
        required: true,
        default: false
    },
    gameRules: { // impostazioni comuni ad ogni partita del torneo
        isRated: { // utilizzato per definire anche partite con o senza rating
            type: Boolean,
            required: true,
            default: true
        },
        timeLimit: {
            type: Number,
            required: true,
            default: 20
        },
        timeIncrement: {
            type: Number,
            default: 0
        }
    }
});

mongoose.pluralize(null);
const model = mongoose.model('Tournament', tournamentSchema);

module.exports = model;