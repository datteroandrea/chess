const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Game = require('../models/game');
const crypto = require('crypto');
const { isAuthenticated } = require('../services/authentication');
const router = new express.Router();

router.get('/', async (req, res) => {
    let games = await Game.find({ isStarted: false });
    res.send(games);
});

router.post('/create', isAuthenticated, async (req, res) => {
    let token = jwt.decode(req.token);
    let game = req.body;

    game.gameId = crypto.randomUUID();

    if (Math.random() >= 0.5) {
        game.whitePlayerId = token.user_id;
    } else {
        game.blackPlayerId = token.user_id;
    }

    game.isRated = req.body.isRated;
    game.timeLimit = req.body.time * 60;
    game.whitePlayerTime = req.body.time * 60;
    game.blackPlayerTime = req.body.time * 60;

    await Game.create(game);
    res.send(game);
});

router.post('/:gameId/play', isAuthenticated, async (req, res) => {
    let gameId = req.params.gameId;
    let token = jwt.decode(req.token);
    let game = await Game.findOne({ gameId });

    // imposta l'id del giocatore soltanto se uno dei due colori è libero
    // e se l'avversario non è il giocatore stesso (colui che ha creato la partita)
    // inoltre imposta la partita come iniziata pertanto non apparirà più tra le partite aperte
    if (game.whitePlayerId === '') {
        if (game.blackPlayerId !== token.user_id) {
            game.whitePlayerId = token.user_id;
        }
    } else if (game.blackPlayerId === '') {
        if (game.whitePlayerId !== token.user_id) {
            game.blackPlayerId = token.user_id;
        }
    }

    await Game.updateOne({ gameId: gameId }, game);

    let timestamp = new Date();

    // gestisci il tempo
    if (game.turn === "white" && game.isStarted) {
        game.whitePlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 1]) / 1000;
    } else if (game.turn === "black" && game.isStarted) {
        game.blackPlayerTime -= (timestamp - game.timestamps[game.timestamps.length - 1]) / 1000;
    }

    res.send(game);
});

router.delete('/delete', async (req,res)=>{
    Game.deleteMany({ }).then((deleted) => {
        res.send("Deleted all games: " +  deleted.deletedCount);
    });
});

module.exports = router;