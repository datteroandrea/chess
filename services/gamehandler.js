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
const { GamesHandler, ChessGame } = require('./games');
const socket = require('socket.io');

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8001, function () {
    console.log("Game server has started on port 8001");
});

const server = socket(httpsServer);

let games = new GamesHandler();

server.on('connection', (socket) => {
    let token;
    let gameId;

    socket.on('join', async (message) => {
        console.log("JOINED");
        message = JSON.parse(message);
        token = message.token;
        gameId = message.gameId;

        let gameRecord = await Game.findOne({ gameId });

        let userId = jwt.decode(token).userId;
        Object.freeze(token);
        Object.freeze(gameId);
        if (gameRecord) {
            if (!games.getGame(gameId)) {

                games.createGame(await Game.findOne({ gameId }), (whitePlayerSocket, blackPlayerSocket) => {
                    whitePlayerSocket?.emit("start");
                    blackPlayerSocket?.emit("start");
                    console.log("STARTED");

                    games.getGame(gameId).timeoutId = scheduler.addJob(async () => {
                        games.getGame(gameId).timeout((turn, whiteSocket, blackSocket) => {
                            // on timeout
                            whiteSocket?.emit("lose", "Timeout");
                            blackSocket?.emit("win", "Timeout");
                        })
                    }, gameRecord.whitePlayerTime);
                });
                
            }

            if(gameRecord.whitePlayerId === jwt.decode(token).userId && games.getGame(gameId).whiteCrashTimeoutId) {
                scheduler.removeJob(games.getGame(gameId).whiteCrashTimeoutId);
            } else if(gameRecord.blackPlayerId === jwt.decode(token).userId && games.getGame(gameId).blackCrashTimeoutId) {
                scheduler.removeJob(games.getGame(gameId).blackCrashTimeoutId);
            }

            let color = (userId === gameRecord.whitePlayerId) ? "w" : "b";
            games.getGame(gameId).setPlayer(userId, color, socket);
        }
    });

    socket.on('move', (message) => {
        message = JSON.parse(message);
        let { move } = message;
        games.getGame(gameId).move(jwt.decode(token).userId, move, (whiteSocket, blackSocket, color) => {
            // on move
            if (color === "w") {
                blackSocket?.emit('move', move);
            } else if (color === "b") {
                whiteSocket?.emit('move', move);
            }

            if (games.getGame(gameId).timeoutId) {
                scheduler.removeJob(games.getGame(gameId).timeoutId);
            }

            let time = color === "w" ? games.getGame(gameId).game.blackPlayerTime : games.getGame(gameId).game.whitePlayerTime;

            games.getGame(gameId).timeoutId = scheduler.addJob(async () => {
                // BUG: inverte il giocatore che dovrebbe vincere quando il tempo scade
                console.log("TIMEOUT");
                // PER FIXXARE IL BUG SI POTREBBE PRENDERE IL COLOR DIRETTAMENTE DALLA CALLBACK INVECE CHE IMPOSTARLO MANUALMENTE
                games.getGame(gameId).timeout((turn, whiteSocket, blackSocket) => {
                    console.log("TURN: " + turn);
                    // on timeout
                    if (turn === "w") {
                        whiteSocket?.emit("lose", "Timeout");
                        blackSocket?.emit("win", "Timeout");
                    } else {
                        whiteSocket?.emit("win", "Timeout");
                        blackSocket?.emit("lose", "Timeout");
                    }
                })
            }, time);
        }, (whiteSocket, blackSocket, color) => {
            console.log("CHECKMATE");
            // on checkmate
            if (color === "w") {
                blackSocket?.emit("lose", "Checkmate");
            } else if (color === "b") {
                whiteSocket?.emit("lose", "Checkmate");
            }
        }, (whiteSocket, blackSocket, color) => {
            // on draw
            if (color === "w") {
                blackSocket?.emit("draw", "Draw");
            } else if (color === "b") {
                whiteSocket?.emit("draw", "Draw");
            }
        });
    });

    socket.on('surrender', (message) => {
        console.log("SURRENDER");
        message = JSON.parse(message);
        let playerId = jwt.decode(token).userId;
        let game = games.getGame(gameId);
        game.surrender(playerId, (whiteSocket, blackSocket) => {
            if (game.game.whitePlayerId === playerId) {
                blackSocket?.emit("win", "Surrender");
            } else if (game.game.blackPlayerId === playerId) {
                whiteSocket?.emit("win", "Surrender");
            }
        })
    });

    socket.on('offer-draw', (message) => {
        console.log("DRAW");
        message = JSON.parse(message);
        let playerId = jwt.decode(token).userId;
        let game = games.getGame(gameId);
        game.offerDraw(playerId, (whiteSocket, blackSocket) => {
            console.log("OFFERED DRAW");
            // on offer draw
            if (game.game.whitePlayerId === playerId) {
                blackSocket?.emit("offer-draw");
            } else if (game.game.blackPlayerId === playerId) {
                whiteSocket?.emit("offer-draw");
            }
        }, (whiteSocket, blackSocket) => {
            console.log("ACCEPTED DRAW");
            // on accept draw
            if (game.game.whitePlayerId === playerId) {
                blackSocket?.emit("accepted-draw", "Agreement");
            } else if (game.game.blackPlayerId === playerId) {
                whiteSocket?.emit("accepted-draw", "Agreement");
            }
        });
    });

    socket.on('disconnect', async () => {
        console.log("DISCONNECTED");
        let game = await Game.findOne({ gameId });

        let jobId = scheduler.addJob(async () => {
            if (game && !game.hasEnded) {
                let winnerSocket;

                if (game.whitePlayerId === jwt.decode(token).userId) {
                    game.winnerId = game.blackPlayerId;
                    winnerSocket = games.getGame(gameId).blackPlayerSocket;
                } else if (game.blackPlayerId === jwt.decode(token).userId) {
                    game.winnerId = game.whitePlayerId;
                    winnerSocket = games.getGame(gameId).whitePlayerSocket;
                }

                game.hasEnded = true;
                await Game.updateOne({ gameId }, game);
                
                winnerSocket?.emit('win', "Timeout");
                console.log("ALL GOOD!");
            }
        }, 60);

        if (game && game.whitePlayerId === jwt.decode(token).userId) {
            games.getGame(gameId).whiteCrashTimeoutId = jobId;
        } else if (game && game.blackPlayerId === jwt.decode(token).userId) {
            games.getGame(gameId).blackCrashTimeoutId = jobId;
        }
    });
});

/*server.on('request', async (request) => {
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
});*/

module.exports = server;