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

io.on('connection', (socket) => {
    socket.on("join-room", (roomId, userId)=>{
        socket.join(roomId);
        console.log(userId);
        socket.to(roomId).emit('user-connected', userId);
    });
});

module.exports = io;