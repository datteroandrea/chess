const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Room = require('../models/room');
const crypto = require('crypto');
const { isAuthenticated } = require('../services/authentication');
const router = new express.Router();

router.get('/', async (req, res) => {
    let rooms = await Room.find({ isPublic: true });
    res.send(rooms);
});

router.post('/create', isAuthenticated, async (req, res) => {
    let token = jwt.decode(req.token);
    let room = req.body;

    room.roomId = crypto.randomUUID();
    room.admins = [ token.user_id ];

    await Room.create(room);
    res.send(room);
});

router.post('/:roomId', isAuthenticated, async (req, res) => {
    let roomId = req.params.roomId;
    let token = jwt.decode(req.token);
    let room = await Room.findOne({ roomId: roomId });

    res.send(room);
});

router.delete('/delete', async (req, res) => {
    Room.deleteMany({ }).then((deleted)=>{
        res.send("Deleted all rooms: " + deleted.deletedCount);
    });
});

module.exports = router;