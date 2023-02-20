const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Profile = require('../models/profile');
const router = new express.Router();

router.get('/', async (req,res)=>{
    let token = jwt.decode(req.token);
    let user = await User.findOne({ userId: token.userId });
    let profile = await Profile.findOne({ profileId: token.userId });
    return res.send({ email: user.email, username: user.username, elo: profile.elo });
});

module.exports = router;