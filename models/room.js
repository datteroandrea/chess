const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        unique: true,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    admins: {
        type: []
    },
    moves: {
        type: [],
        default: []
    },
    timestamps: {
        type: [],
        default: []
    },
    approved: {
        type: [],
        default: []
    },
    position: {
        type: String,
        default: ""
    }
});

mongoose.pluralize(null);
const model = mongoose.model('Room', roomSchema);

module.exports = model;