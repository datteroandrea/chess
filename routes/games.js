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

    await Game.create(game);
    res.send(game);
});

router.post('/:gameId/play', isAuthenticated, async (req, res) => {
    let gameId = req.params.gameId;
    let token = jwt.decode(req.token);
    let game = await Game.findOne({ gameId: gameId });

    // imposta l'id del giocatore soltanto se uno dei due colori è libero
    // e se l'avversario non è il giocatore stesso (colui che ha creato la partita)
    // inoltre imposta la partita come iniziata pertanto non apparirà più tra le partite aperte
    if (game.whitePlayerId === '') {
        if (game.blackPlayerId !== token.user_id) {
            game.whitePlayerId = token.user_id;
            game.isStarted = true;
        }
    } else if (game.blackPlayerId === '') {
        if (game.whitePlayerId !== token.user_id) {
            game.blackPlayerId = token.user_id;
            game.isStarted = true;
        }
    }

    await Game.updateOne({ gameId: gameId }, game);
    res.send(game);
});

module.exports = router;