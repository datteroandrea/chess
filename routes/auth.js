const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const Profile = require('../models/profile');
const config = require('../config');

const router = express.Router();

router.post('/sign-in', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findOne({ email: email });
    
    if (user && bcryptjs.compareSync(password, user.password)) {
        jwt.sign({ userId: user.userId }, config.app.secretKey, { expiresIn: 60 * 60 * 24 * 7 }, (err, token) => {
            return res.send(token);
        });
    } else {
        return res.send({ error: "Wrong email or password." });
    }
});

router.post('/sign-up', async (req, res) => {
    let user = req.body;
    user.userId = crypto.randomUUID();
    let email = await User.findOne({ email: user.email });
    let username = await User.findOne({ username: user.username });
    if(email) {
        return res.send({ error: "User with given email already exists!" });
    }

    if(username) {
        return res.send({ error: "User with given username already exists!" });
    }

    User.create(user);
    Profile.create({ userId: user.userId });
    res.send({ message: "Signed up" })
});

router.post('/sign-out', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    let user = await User.findOne({ email: email });

    if (user && bcryptjs.compareSync(password, user.password)) {
        User.deleteOne({ email: email });
        return res.redirect("/sign-in");
    } else {
        return res.send({ "error": "Wrong password." });
    }
});

module.exports = {
    router
};