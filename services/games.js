const { Chess } = require('chess.js');
const crypto = require('crypto');
const Game = require('../models/game');

class ChessGame {
    constructor(game, onCheckmate, onDraw, onSurrender, onOfferDraw, onAcceptDraw) {
        this.game = game;
        this.position = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        this.askDrawCountdown = 5;
        this.onCheckmate = onCheckmate;
        this.onDraw = onDraw;
        this.onOfferDraw = onOfferDraw;
        this.onTimeout = onTimeout;
        this.onSurrender = onSurrender;
        this.onAcceptDraw = onAcceptDraw;
        this.onCrashTimeout = onCrashTimeout;
    }

    move(playerId, move) {
        let timestamp = new Date();
        this.game.timestamps.push(timestamp);
        if(this.game.isStarted && !this.game.hasEnded) {
            if ((this.position.turn() == "w" && playerId === whitePlayerId) || (this.position.turn() == "b" && playerId === blackPlayerId)) {
                if (this.position.turn() == "w") {
                    this.game.whitePlayerTime -= Math.floor((timestamp - this.game.timestamps[this.game.timestamps.length - 1]) / 1000);
                } else if (this.position.turn() == "b") {
                    this.game.blackPlayerTime -= Math.floor((timestamp - this.game.timestamps[this.game.timestamps.length - 1]) / 1000);
                }
                
                this.position.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.substring(4, 5) });

                if(this.position.game_over()) {
                    this.game.hasEnded = true;
                    if (this.position.in_checkmate()) {
                        this.game.winnerId = playerId;
                        this.onCheckmate();
                        // this.game.reason = "checkmate";
                    } else if (this.position.in_draw()) {
                        this.onDraw();
                        // this.game.reason = "draw"
                    }
                }
                await Game.updateOne({ gameId: this.game.gameId }, this.game );
            }
        }
    }

    surrender(playerId) {
        // controlla se la surrender avviene dal giocatore che può surrender e non da altri
        let timestamp = new Date();
        this.game.timestamps.push(timestamp);
        this.game.hasEnded = true;
        let winnerId = (this.game.whitePlayerId === playerId)? this.game.blackPlayerId : this.game.whitePlayerId;
        this.game.winnerId = winnerId;
        // this.game.reason = "surrendered";
        await Game.updateOne({ gameId: this.game.gameId }, this.game );
        this.onSurrender();
    }

    offerDraw(playerId) {
        // controlla se la offer draw avviene dal giocatore che può offrire la draw e non da altri
    }

    acceptDraw(playerId) {
        // controlla se la accept draw avviene dal giocatore che può appunto accettare la draw e non da altri
        let timestamp = new Date();
        this.game.timestamps.push(timestamp);
        this.game.hasEnded = true;
        // this.game.reason = "draw";
        await Game.updateOne({ gameId: this.game.gameId }, this.game );
        this.onAcceptDraw();
    }

    timeout(playerId) {
        let timestamp = new Date();
        this.game.timestamps.push(timestamp);
        this.game.hasEnded = true;
        let winnerId = (this.game.whitePlayerId === playerId)? this.game.blackPlayerId : this.game.whitePlayerId;
        this.game.winnerId = winnerId;
        // this.game.reason = "timeout";
        await Game.updateOne({ gameId: this.game.gameId }, this.game );
    }

    setWhitePlayerId(whitePlayerId) {
        this.game.whitePlayerId = whitePlayerId;

        if(this.game.whitePlayerId && this.game.blackPlayerId) {
            this.hasStarted = true;
        }
    }

    setBlackPlayerId(blackPlayerId) {
        this.game.blackPlayerId = blackPlayerId;

        if(this.game.whitePlayerId && this.game.blackPlayerId) {
            this.hasStarted = true;
        }
    }

}

class GamesHandler {
    constructor() {
        this.games = {};
    }

    createGame(game, onCheckmate, onDraw, onSurrender, onOfferDraw, onAcceptDraw, onTimeout, onCrashTimeout) {
        let gameId = crypto.randomUUID();
        this.games[gameId] = new ChessGame(game, onCheckmate, onDraw, onSurrender, onOfferDraw, onAcceptDraw, onTimeout, onCrashTimeout);
        return gameId;
    }

    getGame(gameId) {
        return this.games[gameId];
    }

    removeGame(gameId) {
        delete(this.games[gameId]);
    }

}

module.exports = GamesHandler;