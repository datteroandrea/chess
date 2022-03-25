const { PeerServer } = require('peer');
const fs = require('fs');
const path = require('path');


const peerServer = PeerServer({
    port: 8003,
    path: '/',
    ssl: {
        key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
    }
});

module.exports = peerServer;