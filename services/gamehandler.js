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
                games.getGame(gameId).timeout((turn, whiteSocket, blackSocket) => {
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
        message = JSON.parse(message);
        let playerId = jwt.decode(token).userId;
        let game = games.getGame(gameId);
        game.offerDraw(playerId, (whiteSocket, blackSocket) => {
            // on offer draw
            if (game.game.whitePlayerId === playerId) {
                blackSocket?.emit("offer-draw");
            } else if (game.game.blackPlayerId === playerId) {
                whiteSocket?.emit("offer-draw");
            }
        }, (whiteSocket, blackSocket) => {
            // on accept draw
            if (game.game.whitePlayerId === playerId) {
                blackSocket?.emit("accepted-draw", "Agreement");
            } else if (game.game.blackPlayerId === playerId) {
                whiteSocket?.emit("accepted-draw", "Agreement");
            }
        });
    });

    socket.on('disconnect', async () => {
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
            }
        }, 60);

        if (game && game.whitePlayerId === jwt.decode(token).userId) {
            games.getGame(gameId).whiteCrashTimeoutId = jobId;
        } else if (game && game.blackPlayerId === jwt.decode(token).userId) {
            games.getGame(gameId).blackCrashTimeoutId = jobId;
        }
    });
});

module.exports = server;