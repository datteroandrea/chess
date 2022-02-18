const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user')
const config = require('../config');

const router = express.Router();

router.post('/sign-in', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findOne({ email: email });
    
    if (user && bcryptjs.compareSync(password, user.password)) {
        jwt.sign({ user_id: user.user_id }, config.app.secretKey, { expiresIn: 60 * 60 * 24 * 7 }, (err, token) => {
            return res.send(token);
        });
    } else {
        return res.send({ "error": "Wrong email or password." });
    }
});

router.post('/sign-up', async (req, res) => {
    let user = req.body;
    user.user_id = crypto.randomUUID();
    User.create(user);
    res.redirect("/sign-in");
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