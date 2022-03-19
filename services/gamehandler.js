const WebSocketServer = require('websocket').server;
const https = require('https');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Profile = require('../models/profile');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8001, function () {
    console.log("Server has started on ports 8000 and 8001");
});

const server = new WebSocketServer({
    httpServer: httpsServer
});

function sendMessage(socket, message) {
    if (socket != null) {
        socket.send(JSON.stringify(message));
    }
}

function setGameTimeout(game) {
    if (game.turn === "white" && !games[game.gameId].whiteTimeout) {
        games[game.gameId].whiteTimeout = setTimeout(async () => {
            let timestamp = new Date();
            if (!game.hasEnded) {
                game.timestamps.push(timestamp);
                game.whitePlayerTime = 0;
                game.hasEnded = true;
                game.winnerId = game.blackPlayerId;
                await Game.updateOne({ gameId: game.gameId }, game);

                sendMessage(games[game.gameId].blackSocket, { type: 'win', reason: "Timeout" });
                sendMessage(games[game.gameId].whiteSocket, { type: 'lose', reason: "Timeout" });
            }

        }, game.whitePlayerTime * 1000);
    } else if (game.turn === "black" && !games[game.gameId].blackTimeout) {
        games[game.gameId].blackTimeout = setTimeout(async () => {
            let timestamp = new Date();
            if (!game.hasEnded) {
                game.timestamps.push(timestamp);
                game.blackPlayerTime = 0;
                game.hasEnded = true;
                game.winnerId = game.whitePlayerId;
                await Game.updateOne({ gameId: game.gameId }, game);
                sendMessage(games[game.gameId].whiteSocket, { type: 'win', reason: "Timeout" });
                sendMessage(games[game.gameId].blackSocket, { type: 'lose', reason: "Timeout" });
            }
        }, game.blackPlayerTime * 1000);
    }
}

let games = {};

server.on('request', async (request) => {
    let connection = request.accept();
    let token;
    let gameId;

    connection.on('message', async function (message) {
        message = JSON.parse(message.utf8Data);
        if (!token) token = jwt.decode(message.token);
        if (!gameId) gameId = message.gameId;
        let game = await Game.findOne({ gameId });

        if (!game.hasEnded) {

            // se la partita è appena stata creata la aggiunge alla lista delle parite
            if (!games[gameId]) {
                games[gameId] = {
                    position: new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                };
            }

            // imposta il socket del giocatore nel game
            if (token.user_id === game.whitePlayerId) {
                games[gameId].whiteSocket = connection;
            } else if (token.user_id === game.blackPlayerId) {
                games[gameId].blackSocket = connection;
            }

            let timestamp = new Date();

            // se entrambi i giocatori sono entrati allora segna il momento dell'inizio della partita
            if(game.whitePlayerId != '' && game.blackPlayerId != '' && !game.isStarted) {
                game.isStarted = true;
                game.timestamps.push(timestamp);
                sendMessage(games[gameId].whiteSocket, { type: "start", time: game.whitePlayerTime });
                sendMessage(games[gameId].blackSocket, { type: "start", time: game.whitePlayerTime });
                setGameTimeout(game); // imposto il timeout
            }

            // gestisci il tempo
            if (game.turn === "white" && game.isStarted) {
                game.whitePlayerTime -= (timestamp - games[gameId].lastUpdate) / 1000;
                games[gameId].lastUpdate = timestamp;
            } else if (game.turn === "black" && game.isStarted) {
                game.blackPlayerTime -= (timestamp - games[gameId].lastUpdate) / 1000;
                games[gameId].lastUpdate = timestamp;
            }

            // rimuovi gli eventuali timeout nel caso il giocatore fosse crashato e rientrato in tempo
            if (token.user_id == game.whitePlayerId && games[game.gameId].whiteCrashTimeout) {
                clearTimeout(games[game.gameId].whiteCrashTimeout);
                games[game.gameId].whiteCrashTimeout = null;
            } else if (token.user_id == game.blackPlayerId && games[game.gameId].blackCrashTimeout) {
                clearTimeout(games[game.gameId].blackCrashTimeout);
                games[game.gameId].blackCrashTimeout = null;
            }

            let { move } = message;

            if (move) {
                // controlla se la mossa è legale

                games[gameId].position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });

                // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket ed il game)
                if (games[gameId].position.game_over()) {
                    game.hasEnded = true;
                    if (games[gameId].position.in_checkmate()) {
                        game.winnerId = token.user_id;
                    }
                }

                // controlla l'id e se esso appartiene ad uno dei giocatori manda la mossa all'altro giocatore
                let message = { type: 'move', move: move };

                if (token.user_id == game.whitePlayerId && game.turn === "white") {
                    clearTimeout(games[gameId].whiteTimeout);
                    games[gameId].whiteTimeout = null;
                    game.turn = "black";
                    sendMessage(games[gameId].blackSocket, message);
                } else if (token.user_id == game.blackPlayerId && game.turn === "black") {
                    clearTimeout(games[game.gameId].blackTimeout);
                    games[game.gameId].blackTimeout = null;
                    game.turn = "white";
                    sendMessage(games[gameId].whiteSocket, message);
                } else {
                    // in caso la richiesta avvenga da un id che non appartiene a nessuno dei 2 giocatori allora non considerarla
                    return;
                }

                setGameTimeout(game);

                game.timestamps.push(timestamp);

                // aggiungi la mossa nella lista delle mosse della partita e aggiorna la partita nel database
                game.moves.push(message.move);
            }

            await Game.updateOne({ gameId }, game);
        }

    });

    connection.on('close', async function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
        let game = await Game.findOne({ gameId });
        let message = { type: 'win', reason: "Timeout" };

        console.log(gameId);
        console.log(game);

        if (!game.hasEnded) {
            if (token.user_id === game.blackPlayerId) {
                games[gameId].blackCrashTimeout = setTimeout(async () => {
                    let winnerConnection = games[gameId].whiteSocket;
                    let winnerId = game.whitePlayerId;
                    game.winnerId = winnerId;
                    game.hasEnded = true;
                    Game.updateOne({ gameId }, game);
                    sendMessage(winnerConnection, message);
                }, 60000);
            } else if (token.user_id === game.whitePlayerId) {
                games[gameId].whiteCrashTimeout = setTimeout(async () => {
                    let winnerConnection = games[gameId].blackSocket;
                    let winnerId = game.blackPlayerId;
                    game.winnerId = winnerId;
                    game.hasEnded = true;
                    Game.updateOne({ gameId }, game);
                    sendMessage(winnerConnection, message);
                }, 60000);
            }
        }
    });
});

module.exports = server;