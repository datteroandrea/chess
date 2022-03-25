const WebSocketServer = require('websocket').server;
const https = require('https');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Profile = require('../models/profile');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');
const scheduler = require('../services/scheduler');

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8001, function () {
    console.log("Game server has started on port 8001");
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
    let time = game.turn === "white" ? game.whitePlayerTime : game.blackPlayerTime;
    games[game.gameId].timeoutId = scheduler.addJob(async ()=>{
        let timestamp = new Date();

        if (!game.hasEnded) {

            game.timestamps.push(timestamp);
            game.hasEnded = true;
            let winnerSocket;
            let loserSocket;

            if(game.turn === "white") {
                game.whitePlayerTime = 0;
                game.winnerId = game.blackPlayerId;
                winnerSocket = games[game.gameId].blackSocket;
                loserSocket = games[game.gameId].whiteSocket;
            } else {
                game.blackPlayerTime = 0;
                game.winnerId = game.blackPlayerId;
                winnerSocket = games[game.gameId].whiteSocket;
                loserSocket = games[game.gameId].blackSocket;
            }
            
            await Game.updateOne({ gameId: game.gameId }, game);
            sendMessage(winnerSocket, { type: 'win', reason: "Timeout" });
            sendMessage(loserSocket, { type: 'lose', reason: "Timeout" });
        }

    }, time);
}

let games = {};

server.on('request', async (request) => {
    let connection = request.accept();
    let token;
    let gameId;

    connection.on('message', async function (message) {
        message = JSON.parse(message.utf8Data);
        if (!token) {
            token = jwt.decode(message.token);
            Object.freeze(token);
        }
        if (!gameId) {
            gameId = message.gameId;
            Object.freeze(gameId);
        }
        let game = await Game.findOne({ gameId });

        let timestamp = new Date();
        
        if (!game.hasEnded) {

            // se la partita è appena stata creata la aggiunge alla lista delle partite
            if (!games[gameId]) {
                games[gameId] = {
                    position: new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
                    drawCountdown: 5
                };
            }

            // imposta il socket del giocatore nel game
            if (token.userId === game.whitePlayerId) {
                games[gameId].whiteSocket = connection;
            } else if (token.userId === game.blackPlayerId) {
                games[gameId].blackSocket = connection;
            }

            // se entrambi i giocatori sono entrati allora segna il momento dell'inizio della partita
            if(game.whitePlayerId != '' && game.blackPlayerId != '' && !game.isStarted) {
                game.isStarted = true;
                game.timestamps.push(timestamp);
                sendMessage(games[gameId].whiteSocket, { type: "start", time: game.whitePlayerTime });
                sendMessage(games[gameId].blackSocket, { type: "start", time: game.whitePlayerTime });
                setGameTimeout(game);
            }

            // controlla che la richiesta avvenga da uno dei giocatori nella partita e non da un utente estraneo
            if(token.userId == game.whitePlayerId || token.userId == game.blackPlayerId) {

                // rimuovi gli eventuali timeout nel caso il giocatore fosse crashato e rientrato in tempo
                if (token.userId == game.whitePlayerId && games[gameId].whiteCrashTimeoutId) {
                    scheduler.removeJob(games[gameId].whiteCrashTimeoutId);
                } else if (token.userId == game.blackPlayerId && games[gameId].blackCrashTimeoutId) {
                    scheduler.removeJob(games[gameId].blackCrashTimeoutId);
                }

                let { move, action } = message;

                // gestisci il tempo
                if(action || move) {
                    if (game.turn === "white" && game.isStarted) {
                        game.whitePlayerTime -= Math.floor((timestamp - game.timestamps[game.timestamps.length - 1]) / 1000);
                    } else if (game.turn === "black" && game.isStarted) {
                        game.blackPlayerTime -= Math.floor((timestamp - game.timestamps[game.timestamps.length - 1]) / 1000);
                    }
                    game.timestamps.push(timestamp);
                }

                // controlla se la mossa è stata eseguita dal giocatore corretto (ovvero se la mossa nel turno del bianco è stata eseguita dal giocatore bianco ecc.)
                if (move && ((game.turn === "white" && game.whitePlayerId === token.userId) || (game.turn === "black" && game.blackPlayerId === token.userId))) {
                    

                    // controlla se la mossa è legale

                    // diminuisce il countdown per richiedere una patta
                    games[gameId].drawCountdown--;
    
                    games[gameId].position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });
    
                    // controlla se è checkmate o draw (se lo è setta il risultato nel game invia le risposte ed elimina i due socket ed il game)
                    if (games[gameId].position.game_over()) {
                        game.hasEnded = true;
                        if (games[gameId].position.in_checkmate()) {
                            game.winnerId = token.userId;
                        }
                    }
    
                    // controlla l'id e se esso appartiene ad uno dei giocatori manda la mossa all'altro giocatore
                    let message = { type: 'move', move: move };
    
                    // rimuovi il timeout della mossa
                    scheduler.removeJob(games[gameId].timeoutId);

                    if (game.turn === "white") {
                        sendMessage(games[gameId].blackSocket, message);
                    } else {
                        sendMessage(games[gameId].whiteSocket, message);
                    }

                    game.turn = game.turn === "white" ? "black" : "white";

                    // gestisci l'incremento del tempo
                    if(game.timeIncrement > 0) {
                        if (token.userId === game.whitePlayerId) {
                            game.whitePlayerTime += game.timeIncrement;
                        } else if (token.userId === game.blackPlayerId) {
                            game.blackPlayerTime += game.timeIncrement;
                        }
                    }
    
                    setGameTimeout(game);
    
                    // aggiungi la mossa nella lista delle mosse della partita e aggiorna la partita nel database
                    game.moves.push(message.move);
                    // se è stata eseguita una mossa allora automaticamente rifiuti la draw
                    if(games[gameId].whiteDraw || games[gameId].blackDraw) {
                        games[gameId].whiteDraw = false;
                        games[gameId].blackDraw = false;
                        games[gameId].drawCountdown = 10;
                    }
                }
                
                if(action === "surrender" && game.isStarted) {
                    let message = { type: "win", reason: "Surrender" };
                    game.hasEnded = true;
                    if (token.userId == game.whitePlayerId) {
                        sendMessage(games[gameId].blackSocket, message);
                        game.winnerId = game.blackPlayerId;
                    } else if (token.userId == game.blackPlayerId) {
                        sendMessage(games[gameId].whiteSocket, message);
                        game.winnerId = game.whitePlayerId;
                    }
                } else if(action === "draw" && game.isStarted) {
                    let message = { type: "draw request" };
                    let socket;
                    if (token.userId == game.whitePlayerId && games[gameId].drawCountdown <= 0) {
                        games[gameId].whiteDraw = true;
                        socket = games[gameId].blackSocket;
                    } else if (token.userId == game.blackPlayerId && games[gameId].drawCountdown <= 0) {
                        games[gameId].blackDraw = true;
                        socket = games[gameId].whiteSocket;
                    }
    
                    if(games[gameId].whiteDraw && games[gameId].blackDraw) {
                        game.hasEnded = true;
                        message.type = "draw accepted";
                        message.reason = "Agreement";
                        sendMessage(games[gameId].whiteSocket, message);
                        sendMessage(games[gameId].blackSocket, message);
                    } else {
                        sendMessage(socket, message);
                    }
                }
                
                await Game.updateOne({ gameId }, game);
            }
        }
    });

    connection.on('close', async function (reasonCode, description) {
        // utilizza per la disconnessione dell'utente da una partita
        let game = await Game.findOne({ gameId });
        let message = { type: 'win', reason: "Timeout" };

        let jobId = scheduler.addJob(async ()=>{
            if(game && !game.hasEnded) {
                let winnerSocket;

                if(game.whitePlayerId === token.userId) {
                    game.winnerId = games[gameId].blackPlayerId;
                    winnerSocket = games[gameId].blackSocket;
                } else if(game.blackPlayerId === token.userId) {
                    game.winnerId = games[gameId].whitePlayerId;
                    winnerSocket = games[gameId].whiteSocket;
                }
                
                game.hasEnded = true;
                await Game.updateOne({ gameId }, game);
                sendMessage(winnerSocket, message);
            }
        }, 60);

        if(game && game.whitePlayerId === token.userId) {
            games[gameId].whiteCrashTimeoutId = jobId;
        } else if(game && game.blackPlayerId === token.userId) {
            games[gameId].blackCrashTimeoutId = jobId;
        }
    });
});

module.exports = server;