const fs = require('fs');
const https = require('https');
const path = require('path');
const socket = require("socket.io");
const Room = require("../models/room");
const crypto = require('crypto');
const User = require('../models/user');

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8002, function () {
    console.log("Room server has started on port 8002");
});

const io = socket(httpsServer);

let rooms = {};

io.on('connection', (socket) => {
    socket.on("join-room", async (roomId, userSessionId, userId) => {
        let room = await Room.findOne({ roomId });
        
        if (!rooms[roomId]) {
            rooms[roomId] = {};
            rooms[roomId] = { roomId, isPublic: room.isPublic, moves: room.moves, timestamps: room.timestamps }
            rooms[roomId].users = {};
            rooms[roomId].admins = [];
            rooms[roomId].askingAccess = {};
        }

        if(room.admins.includes(userId)) {
            if(!rooms[roomId].admins.includes(userSessionId)) {
                rooms[roomId].admins.push(userSessionId);
            }
        }

        rooms[roomId].users[userSessionId] = { socket, userId: userId };
        socket.join(roomId);
        socket.to(roomId)?.emit('user-connected', userSessionId);

        socket.on("toggle-mute", async () => {
            // invia a tutti gli utenti che l'utente si è mutato
            socket.to(roomId)?.emit('toggle-mute', userSessionId);
        });

        socket.on("toggle-camera", async () => {
            // invia a tutti gli utenti che l'utente ha disattvato la camera
            socket.to(roomId)?.emit('toggle-camera', userSessionId);
        });

        socket.on("toggle-board", async (clientId) => {
            // invia all'utente collegato la possibilità di muovere i pezzi nella scacchiera a piacere
            rooms[roomId].users[clientId].socket?.emit("toggle-board");
            rooms[roomId].users[clientId].canMove = true;
        });

        socket.on("admin-mute", async (clientId) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (rooms[roomId].admins.includes(userId)) {
                socket.to(roomId)?.emit('admin-mute', clientId);
            }
        });

        socket.on('board-update', async (position, move) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (rooms[roomId].admins.includes(userId) || rooms[roomId].users[clientId].canMove) {
                socket.to(roomId)?.emit('board-update', position, move);
            }
        });

        socket.on('toggle-stockfish', async () => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (rooms[roomId].admins.includes(userId)) {
                socket.to(roomId)?.emit('toggle-stockfish', position);
            }
        });

        socket.on('comment', async (comment) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (rooms[roomId].admins.includes(userId)) {
                socket.to(roomId)?.emit('comment', comment);
            }
        });

        socket.on('toggle-move', async (state) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if (rooms[roomId].admins.includes(userId)) {
                socket.to(roomId)?.emit('toggle-move', state);
                for (const clientId in rooms[roomId].users) {
                    rooms[roomId].users[clientId].canMove = true;
                }
            }
        });

        socket.on('move', async (move) => {
            // controlla se può muovere
            if (rooms[roomId].users[userSessionId].canMove) {
                socket.to(roomId)?.emit('move', userSessionId, move);
                rooms[roomId].users[userSessionId].canMove = false;
            }
        });

        socket.on('disconnect', async () => {
            delete (rooms[roomId].users[userSessionId]);
            socket.to(roomId)?.emit('user-disconnected', userSessionId);
        });
    });

    socket.on('ask-access', async (roomId, userId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {};
            let room = await Room.findOne({ roomId });
            rooms[roomId] = { roomId, isPublic: room.isPublic, admins: room.admins, moves: room.moves, timestamps: room.timestamps }
            rooms[roomId].users = {};
            rooms[roomId].askingAccess = {};
        }
        // creiamo un nuovo userAccessId per non inviare l'effettivo id del giocatore il quale deve essere sempre protetto
        // e conosciuto solamente dal giocatore stesso!
        let user = await User.findOne({ userId });
        let userAccessId = crypto.randomUUID();
        rooms[roomId][userAccessId] = { userId: userId, socket: socket };

        // invia all'admin la richiesta di accesso
        rooms[roomId].admins.forEach((adminSessionId) => {
            rooms[roomId].users[adminSessionId].socket?.emit("ask-access", userAccessId, user.username, user.email );
        })
    });

    socket.on('admin-approved', async (roomId, userAccessId, adminId) => {
        let room = await Room.findOne({ roomId });
        if (room.admins.includes(adminId)) {
            let userId = rooms[roomId][userAccessId].userId;
            let userSocket = rooms[roomId][userAccessId].socket;
            room.approved.push(userId);
            await Room.updateOne({ roomId: roomId }, room);
            userSocket?.emit("admin-approved", roomId);
        }
    });

    socket.on('ban', async (roomId, userSessionId, adminId) => {
        if (rooms[roomId].admins.includes(adminId)) {
            let userId = rooms[roomId].users[userSessionId].userId;
            let userSocket = rooms[roomId].users[userSessionId].socket;
            let room = await Room.findOne({ roomId });
            room.approved.splice(room.approved.indexOf(userId), 1);
            await Room.updateOne({ roomId: roomId }, room);
            userSocket?.emit("ban", roomId);
        }
    })
    
});

module.exports = io;