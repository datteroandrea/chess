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
    room.admins = [ token.userId ];

    await Room.create(room);
    res.send(room);
});

router.get('/:roomId', async (req, res) => {
    let roomId = req.params.roomId;
    let room = await Room.findOne({ roomId: roomId });
    res.send(room);
});

router.get('/:roomId/admin', isAuthenticated, async (req, res) => {
    let roomId = req.params.roomId;
    let userId = jwt.decode(req.token).userId;
    let room = await Room.findOne({ roomId: roomId });
    res.send({ isAdmin: room.admins.some((adminId) => userId === adminId) });
});

router.delete('/delete', async (req, res) => {
    Room.deleteMany({ }).then((deleted)=>{
        res.send("Deleted all rooms: " + deleted.deletedCount);
    });
});

module.exports = router;