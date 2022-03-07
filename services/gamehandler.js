const WebSocketServer = require('websocket').server;
const http = require('http');
const User = require('../models/user');
const Profile = require('../models/profile');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');

const httpServer = http.createServer(function (request, response) { }).listen(8001, function () {
    console.log("Server has started on ports 8000 and 8001");
});

const server = new WebSocketServer({
    httpServer: httpServer
});

function sendMessage(socket, message) {
    if (socket != null) {
        socket.send(JSON.stringify(message));
    }
}

let games = {};

server.on('request', async (request) => {
    let connection = request.accept();
    let token;
    let gameId;

    connection.on('message', async function (message) {
        message = JSON.parse(message.utf8Data);
        token = jwt.decode(message.token);
        gameId = message.gameId;
        let game = await Game.findOne({ gameId });

        // se la partita è appena stata creata la aggiunge alla lista delle parite
        if (!games[gameId]) {
            games[gameId] = {
                position: new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            };
        }

        // controlla se la connessione era caduta
        if (token.user_id === game.blackPlayerId && games[gameId].blackCrashTimeout) {
            clearTimeout(games[gameId].blackCrashTimeout);
            games[gameId].blackCrashTimeout = null;
        } else if (token.user_id === game.whitePlayerId && games[gameId].whiteCrashTimeout) {
            clearTimeout(games[gameId].whiteCrashTimeout);
            games[gameId].whiteCrashTimeout = null;
        }

        // imposta il socket del giocatore nel game
        // ATTENZIONE: non cambiare questa parte di codice mettendo che se il socket è già impostato allora non serve cambiarlo
        // in quanto si buggerebbe nel caso uno dei due utenti crashasse e dovesse rientrare nella partita
        if (token.user_id == game.whitePlayerId) {
            games[gameId].whiteSocket = connection;
        } else if (token.user_id == game.blackPlayerId) {
            games[gameId].blackSocket = connection;
        }

        // gestisci il tempo
        let timestamp = new Date();
        game.timestamps.push(timestamp);

        if (token.user_id === game.whitePlayerId && game.timestamps.length > 1) {
            game.whitePlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 2]) / 1000;
        } else if (token.user_id === game.blackPlayerId && game.timestamps.length > 1) {
            game.blackPlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 2]) / 1000;
        }

        let move = message.move;

        if (move) {
            games[gameId].position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });
            // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket ed il game)
            if (games[gameId].position.game_over()) {
                game.hasEnded = true;
                if (games[gameId].position.in_checkmate()) {
                    game.winnerId = token.user_id;
                }
            }

            // controlla l'id e se esso appartiene ad uno dei giocatori manda la mossa all'altro giocatore
            let message = { type: 'move', timestamp: timestamp, move: move };

            if (token.user_id == game.whitePlayerId) {
                message.time = game.blackPlayerTime;
                sendMessage(games[gameId].blackSocket, message);
            } else if (token.user_id == game.blackPlayerId) {
                message.time = game.whitePlayerTime;
                sendMessage(games[gameId].whiteSocket, message);
            } else {
                // in caso la richiesta avvenga da un id che non appartiene a nessuno dei 2 giocatori allora non considerarla
                return;
            }

            // aggiungi la mossa nella lista delle mosse della partita e aggiorna la partita nel database
            game.moves.push(message.move);
        }

        await Game.updateOne({ gameId }, game);
    });

    connection.on('close', async function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
        let game = await Game.findOne({ gameId });
        let message = { type: 'win' };
        if (!game.hasEnded) {
            if (token.user_id === game.blackPlayerId) {
                games[gameId].blackCrashTimeout = setTimeout(async () => {
                    game.hasEnded = true;
                    game.winnerId = game.whitePlayerId;
                    sendMessage(games[gameId].whiteSocket, message);
                    Game.updateOne({ gameId }, game);
                }, 5000);
            } else if (token.user_id === game.whitePlayerId) {
                games[gameId].whiteCrashTimeout = setTimeout(async () => {
                    game.hasEnded = true;
                    game.winnerId = game.blackPlayerId;
                    sendMessage(games[gameId].blackSocket, message);
                    Game.updateOne({ gameId }, game);
                }, 5000);
            }
        }
    });
});

module.exports = server;