const WebSocketServer = require('websocket').server;
const http = require('http');
const User = require('../models/user');
const Profile = require('../models/profile');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');

const httpServer = http.createServer(function (request, response) { }).listen(4001, function () {
    console.log("Server has started on ports 4000 and 4001");
});

const server = new WebSocketServer({
    httpServer: httpServer
});

function sendMove(socket, move) {
    if(socket != null) {
        socket.send({ type: "move", move: move })
    }
}

server.on('request', (request) => {
    let connection = request.accept();
    let token;
    let gameId;
    let game;

    connection.on('message', async function (message) {
        message = JSON.parse(message.utf8Data);
        token = jwt.decode(message.token);

        gameId = message.gameId;
        game = await Game.findOne({ gameId });

        // gestisci il tempo
        let timestamp = new Date();
        game.timestamps.push(timestamp);

        // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket)

        // controlla se l'id appartiene ad uno dei giocatori
        if (token.user_id == game.whitePlayerId) {
            // imposta il socket nel game
            game.whitePlayerSocket = connection;
            // manda la mossa all'altro giocatore
            sendMove(game.blackPlayerSocket, message.move);
        } else if (token.user_id == game.blackPlayerId) {
            // imposta il socket nel game
            game.blackPlayerSocket = connection;
            // manda la mossa all'altro giocatore
            sendMove(game.whitePlayerSocket, message.move);
        } else {
            // in caso la richiesta avvenga da un id che non appartiene a nessuno dei 2 giocatori allora non considerarla
            return;
        }

        game.moves.push(message.move);

        await Game.updateOne({ gameId }, game);
    });

    connection.on('close', function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
        console.log({ token, gameId });
    });
});

module.exports = server;