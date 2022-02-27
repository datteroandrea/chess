const WebSocketServer = require('websocket').server;
const http = require('http');
const User = require('../models/user');
const Profile = require('../models/profile');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');

const httpServer = http.createServer(function (request, response) { }).listen(8001, function () {
    console.log("Server has started on ports 8000 and 8001");
});

const server = new WebSocketServer({
    httpServer: httpServer
});

function sendMove(socket, move) {
    if (socket != null) {
        socket.send(JSON.stringify({ type: "move", move: move }))
    }
}

let games = {};

server.on('request', (request) => {
    let connection = request.accept();
    let token;
    let gameId;

    connection.on('message', async function (message) {
        message = JSON.parse(message.utf8Data);
        token = jwt.decode(message.token);
        gameId = message.gameId;

        if(!games[gameId]) { // se il gioco è appena stato creato aggiungilo alla lista dei giochi
            games[gameId] = await Game.findOne({ gameId });
        }

        // imposta il socket del giocatore nel game
        if (token.user_id == games[gameId].whitePlayerId) {
            games[gameId].whiteSocket = connection;
        } else if (token.user_id == games[gameId].blackPlayerId) {
            games[gameId].blackSocket = connection;
        }

        // controlla se l'id appartiene ad uno dei giocatori
        if (message.move != null) {
            // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket ed il game)

            // gestisci il tempo
            let timestamp = new Date();
            games[gameId].timestamps.push(timestamp);
            // controlla l'id e se esso appartiene ad uno dei giocatori manda la mossa all'altro giocatore
            if (token.user_id == games[gameId].whitePlayerId) {
                sendMove(games[gameId].blackSocket, message.move);
            } else if (token.user_id == games[gameId].blackPlayerId) {
                sendMove(games[gameId].whiteSocket, message.move);
            } else {
                // in caso la richiesta avvenga da un id che non appartiene a nessuno dei 2 giocatori allora non considerarla
                return;
            }
            // aggiungi la mossa nella lista delle mosse della partita e aggiorna la partita nel database
            games[gameId].moves.push(message.move);
            await Game.updateOne({ gameId }, games[gameId]);
        }

    });

    connection.on('close', function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
    });
});

module.exports = server;