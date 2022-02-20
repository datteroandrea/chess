let WebSocketServer = require('websocket').server;
let http = require('http');

let httpServer = http.createServer(function (request, response) { });

httpServer.listen(4001, function () {
    console.log("Server has started on ports 4000 and 4001");
});

let server = new WebSocketServer({
    httpServer: httpServer
});

server.on('request', (request) => {
    var connection = request.accept();

    connection.on('message', function (message) {
        console.log('Received Message: ' + message.utf8Data);
    });

    connection.on('close', function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
    });
});

module.exports = server;