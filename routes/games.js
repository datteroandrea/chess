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
    let isWhite = Math.random();

    game.gameId = crypto.randomUUID();

    if (isWhite >= 0.5) {
        game.whitePlayerId = token.user_id;
        game.blackPlayerId = "";
    } else {
        game.whitePlayerId = "";
        game.blackPlayerId = token.user_id;
    }

    await Game.create(game);
    res.send(game);
});

module.exports = router;