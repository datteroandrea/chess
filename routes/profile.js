const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = new express.Router();

router.get('/', async (req,res)=>{
    let token = jwt.decode(req.token);
    let user = await User.findOne({ userId: token.userId });
    return res.send(user);
});

module.exports = router;