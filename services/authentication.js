const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user')
const config = require('../config');

const app = express();

app.get('/', isAuthenticated, (req, res) => {
    jwt.verify(req.token, config.app.secretKey, (err, user) => {
        if (err) {
            res.redirect("/sign-in");
        } else {
            res.json(user);
        }
    });
});

app.post('/sign-in', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findOne({ email: email });
    
    if (user && bcryptjs.compareSync(password, user.password)) {
        jwt.sign({ user_id: user.user_id }, config.app.secretKey, { expiresIn: 60 * 60 * 24 * 7 }, (err, token) => {
            console.log(token);
            return res.send(token);
        });
    } else {
        return res.send({ "error": "Wrong email or password." });
    }
});

app.post('/sign-up', async (req, res) => {
    let user = req.body;
    user.user_id = crypto.randomUUID();
    User.create(user);
    res.redirect("/sign-in");
});

app.post('/unregister', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    let user = await User.findOne({ email: email });

    if (user && bcryptjs.compareSync(password, user.password)) {
        User.deleteOne({ email: email });
        res.redirect("/sign-in");
    } else {
        res.send({ "error": "Wrong email or password." });
    }
});

function isAuthenticated(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.redirect("/sign-in");
    }
}

module.exports = app;