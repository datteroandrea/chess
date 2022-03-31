const fs = require('fs');
const https = require('https');
const path = require('path');
const socket = require("socket.io");
const Room = require("../models/room");

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8002, function () {
    console.log("Room server has started on port 8002");
});

const io = socket(httpsServer);

let room = {};

io.on('connection', (socket) => {
    socket.on("join-room", async (roomId, userSessionId, userId) => {
        if (!room[roomId]) {
            room[roomId] = {};
            let queryRoom = await Room.findOne({ roomId });
            room[roomId] = { roomId, isPublic: queryRoom.isPublic, admins: queryRoom.admins, moves: queryRoom.moves, timestamps: queryRoom.timestamps }
            room[roomId].users = {};
        }
        room[roomId].users[userSessionId] = { socket };
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userSessionId);

        socket.on("toggle-mute", async () => {
            // invia a tutti gli utenti che l'utente si è mutato
            socket.to(roomId).emit('toggle-mute', userSessionId);
        });

        socket.on("toggle-camera", async () => {
            // invia a tutti gli utenti che l'utente ha disattvato la camera
            socket.to(roomId).emit('toggle-camera', userSessionId);
        });

        socket.on("admin-mute", async (clientId) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (room[roomId].admins.includes(userId)) {
                socket.to(roomId).emit('admin-mute', clientId);
            }
        });

        socket.on('board-update', async (position) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (room[roomId].admins.includes(userId)) {
                socket.to(roomId).emit('board-update', position);
            }
        });

        socket.on('toggle-stockfish', async () => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (room[roomId].admins.includes(userId)) {
                socket.to(roomId).emit('toggle-stockfish', position);
            }
        });

        socket.on('comment', async (comment) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (room[roomId].admins.includes(userId)) {
                socket.to(roomId).emit('comment', comment);
            }
        });

        socket.on('toggle-move', async (state) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (room[roomId].admins.includes(userId)) {
                socket.to(roomId).emit('toggle-move', state);
                for (const clientId in room[roomId].users) {
                    room[roomId].users[clientId].canMove = true;
                }
            }
        });

        socket.on('move', async (move) => {
            // controlla se può muovere
            if (room[roomId].users[userSessionId].canMove) {
                socket.to(roomId).emit('move', userSessionId, move);
                room[roomId].users[userSessionId].canMove = false;
            }
        });

        socket.on('disconnect', async () => {
            delete (room[roomId].users[userSessionId]);
            socket.to(roomId).emit('user-disconnected', userSessionId);
        });
    });
});

module.exports = io;