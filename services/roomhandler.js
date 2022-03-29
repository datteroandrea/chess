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

let room = { };

io.on('connection', (socket) => {
    socket.on("join-room", async (roomId, userSessionId, userId)=>{
        if(!room[roomId]) {
            room[roomId] = { };
        }
        room[roomId][userSessionId] = socket;
        room[roomId][userSessionId].userId = userId;
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on("admin-mute", async (userId) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            let queryRoom = await Room.findOne({ roomId });
            if(queryRoom.admins.includes(room[roomId][userSessionId].userId)) {
                room[roomId][userSessionId].emit("admin-mute");
            }
        });

        socket.on('board-update', async (position) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if(queryRoom.admins.includes(room[roomId][userSessionId].userId)) {
                socket.to(roomId).emit('board-update', position);
            }
        });

        socket.on('toggle-stockfish', async ()=>{
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if(queryRoom.admins.includes(room[roomId][userSessionId].userId)) {
                socket.to(roomId).emit('toggle-stockfish', position);
            }
        });

        socket.on('comment', async (comment)=>{
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if(queryRoom.admins.includes(room[roomId][userSessionId].userId)) {
                socket.to(roomId).emit('comment', comment);
            }
        });

        socket.on('toggle-move', async ()=>{
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            if(queryRoom.admins.includes(room[roomId][userSessionId].userId)) {
                socket.to(roomId).emit('toggle-move');
            }
        });

        socket.on('disconnect', async () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

module.exports = io;