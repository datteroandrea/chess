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

function sendMove(socket, message) {
    if (socket != null) {
        socket.send(JSON.stringify(message));
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
        let game = await Game.findOne({ gameId });

        // se la partita è appena stata creata la aggiunge alla lista delle parite
        if(!games[gameId]) {
            games[gameId] = {
                position: new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            };
        }

        // imposta il socket del giocatore nel game
        // ATTENZIONE: non cambiare questa parte di codice mettendo che se il socket è già impostato allora non serve cambiarlo
        // in quanto si buggerebbe nel caso uno dei due utenti crashasse e dovesse rientrare nella partita
        if (token.user_id == game.whitePlayerId) {
            games[gameId].whiteSocket = connection;
        } else if (token.user_id == game.blackPlayerId) {
            games[gameId].blackSocket = connection;
        }

        let move = message.move;

        if (move != null) {
            games[gameId].position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });
            // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket ed il game)
            if(games[gameId].position.game_over()) {
                if(games[gameId].position.in_checkmate()) {
                    game.winnerId = token.user_id;
                    game.hasEnded = true;
                } else if(games[gameId].position.in_stalemate() || games[gameId].position.in_draw() || games[gameId].position.insufficient_material() || games[gameId].position.in_threefold_repetition()) {
                    game.hasEnded = true;
                }
            }
            // gestisci il tempo
            let timestamp = new Date();
            game.timestamps.push(timestamp);

            if (token.user_id == game.whitePlayerId && game.timestamps.length > 1) {
                game.whitePlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 2]) / 1000;
            } else if (token.user_id == game.blackPlayerId && game.timestamps.length > 1) {
                game.blackPlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 2]) / 1000;
            }

            // controlla l'id e se esso appartiene ad uno dei giocatori manda la mossa all'altro giocatore
            let message = { type: 'move', timestamp: timestamp, move: move };
            
            if (token.user_id == game.whitePlayerId) {
                sendMove(games[gameId].blackSocket, message);
            } else if (token.user_id == game.blackPlayerId) {
                sendMove(games[gameId].whiteSocket, message);
            } else {
                // in caso la richiesta avvenga da un id che non appartiene a nessuno dei 2 giocatori allora non considerarla
                return;
            }
            
            // aggiungi la mossa nella lista delle mosse della partita e aggiorna la partita nel database
            game.moves.push(message.move);
            await Game.updateOne({ gameId }, game);
        }

    });

    connection.on('close', function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
    });
});

module.exports = server;