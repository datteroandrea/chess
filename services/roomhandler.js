const fs = require('fs');
const https = require('https');
const path = require('path');
const socket = require("socket.io");

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8002, function () {
    console.log("Room server has started on port 8002");
});

const io = socket(httpsServer);

let room = { };

io.on('connection', (socket) => {
    socket.on("join-room", (roomId, userId)=>{
        if(!room[roomId]) room[roomId] = { };
        room[roomId][userId] = socket;
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on("admin-mute", (mute) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
            room[roomId][userId].emit("admin-mute");
        });

        socket.on('board-update', (position) => {
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
        });

        socket.on('toggle-stockfish', ()=>{
            // controlla se l'utente è admin della room attraverso una query e se si esegui l'emit
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

module.exports = io;