const { Chess } = require('chess.js');
const crypto = require('crypto');
const Game = require('../models/game');

class ChessGame {
    constructor(game, onStarted) {
        this.game = game;
        this.position = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        this.askDrawCountdown = 5;
        this.whiteDraw = false;
        this.blackDraw = false;
        this.onStarted = onStarted;
        this.whitePlayerSocket = null;
        this.blackPlayerSocket = null;
    }

    getPlayerColor(playerId) {
        return this.game.whitePlayerId === playerId ? "w" : this.game.blackPlayerId === playerId ? "b" : null;
    }

    async start() {
        let timestamp = new Date();
        if (!this.game.isStarted && !this.game.hasEnded) {
            this.game.isStarted = true;
            this.game.timestamps.push(timestamp);
            await Game.updateOne({ gameId: this.game.gameId }, this.game);
            this.onStarted(this.whitePlayerSocket, this.blackPlayerSocket);
        }
    }

    async move(playerId, move, onMove, onCheckmate, onDraw) {
        let timestamp = new Date();
        this.game.timestamps.push(timestamp);
        if (this.game.isStarted && !this.game.hasEnded) {
            if ((this.position.turn() == "w" && playerId === this.game.whitePlayerId) || (this.position.turn() == "b" && playerId === this.game.blackPlayerId)) {
                let isValid = this.position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });

                if (isValid) {
                    this.askDrawCountdown--;
                    // siccome la mossa è già stata eseguita sopra allora devo prendere il colore del turno precedente
                    if (this.position.turn() == "w") {
                        this.game.blackPlayerTime -= Math.floor((timestamp - this.game.timestamps[this.game.timestamps.length - 1]) / 1000);
                        this.game.blackPlayerTime += this.game.timeIncrement;
                    } else if (this.position.turn() == "b") {
                        this.game.whitePlayerTime -= Math.floor((timestamp - this.game.timestamps[this.game.timestamps.length - 1]) / 1000);
                        this.game.whitePlayerTime += this.game.timeIncrement;
                    }

                    this.game.moves.push(move);

                    if(this.whiteDraw || this.blackDraw) {
                        this.whiteDraw = false;
                        this.blackDraw = false;
                        this.askDrawCountdown = 10;
                    }

                    // siccome la mossa è già stata eseguita sopra allora devo prendere il colore del turno precedente
                    onMove(this.whitePlayerSocket, this.blackPlayerSocket, this.position.turn() === "w" ? "b" : "w");

                    if (this.position.game_over()) {
                        this.game.hasEnded = true;
                        // siccome la mossa è già stata eseguita sopra allora devo prendere il colore del turno precedente
                        if (this.position.in_checkmate()) {
                            this.game.winnerId = playerId;
                            onCheckmate(this.whitePlayerSocket, this.blackPlayerSocket, this.position.turn() == "w" ? "b" : "w");
                            this.game.reason = "Checkmate";
                        } else if (this.position.in_draw()) {
                            onDraw(this.whitePlayerSocket, this.blackPlayerSocket);
                            this.game.reason = "Draw";
                        }
                    }

                    this.game.turn = this.position.turn() == "w" ? "white" : "black";

                    await Game.updateOne({ gameId: this.game.gameId }, this.game);
                }
            }
        }
    }

    async surrender(playerId, onSurrender) {
        if (this.game.isStarted && !this.game.hasEnded) {
            let playerColor = this.getPlayerColor(playerId);
            if(playerColor) {
                let timestamp = new Date();
                this.game.timestamps.push(timestamp);
                this.game.hasEnded = true;
                let winnerId = (playerColor === "b") ? this.game.blackPlayerId : this.game.whitePlayerId;
                this.game.winnerId = winnerId;
                this.game.reason = "Surrender";
                await Game.updateOne({ gameId: this.game.gameId }, this.game);
                onSurrender(this.whitePlayerSocket, this.blackPlayerSocket);
            }
        }
    }

    async offerDraw(playerId, onOfferDraw, onAcceptDraw) {
        if (this.game.isStarted && !this.game.hasEnded) {
            let playerColor = this.getPlayerColor(playerId);
            if(playerColor && this.askDrawCountdown <= 0) {
                if(playerColor === "w") {
                    this.whiteDraw = true;
                } else {
                    this.blackDraw = true;
                }

                if(this.whiteDraw && this.blackDraw) {
                    this.game.reason = "Draw by Agreement";
                    await Game.updateOne({ gameId: this.game.gameId }, this.game);
                    onAcceptDraw(this.whitePlayerSocket, this.blackPlayerSocket);
                } else {
                    onOfferDraw(this.whitePlayerSocket, this.blackPlayerSocket);
                }
                
            }
        }
    }

    async timeout(onTimeout) {
        if (this.game.isStarted && !this.game.hasEnded) {
            let timestamp = new Date();
            this.game.timestamps.push(timestamp);
            this.game.hasEnded = true;
            let winnerId = (this.position.turn() === "w") ? this.game.blackPlayerId : this.game.whitePlayerId;
            if(this.position.turn() === "w") {
                this.game.whitePlayerTime = 0;
            } else {
                this.game.blackPlayerTime = 0;
            }
            this.game.winnerId = winnerId;
            this.game.reason = "Timeout";
            await Game.updateOne({ gameId: this.game.gameId }, this.game);
            onTimeout(this.position.turn(), this.whitePlayerSocket, this.blackPlayerSocket);
        }
    }

    setPlayer(playerId, color, socket) {
        if(!this.game.hasEnded) {
            if(color === "w") {
                this.game.whitePlayerId = playerId;
                this.whitePlayerSocket = socket;
            } else {
                this.game.blackPlayerId = playerId;
                this.blackPlayerSocket = socket;
            }
        }

        if (!this.game.isStarted && this.game.whitePlayerId && this.game.blackPlayerId) {
            this.start();
        }
    }

}

class GamesHandler {
    constructor() {
        this.games = {};
    }

    createGame(game, onStarted) {
        this.games[game.gameId] = new ChessGame(game, onStarted);
        return this.games[game.gameId];
    }

    getGame(gameId) {
        return this.games[gameId];
    }

    removeGame(gameId) {
        delete (this.games[gameId]);
    }

}

module.exports = {
    GamesHandler,
    ChessGame
};