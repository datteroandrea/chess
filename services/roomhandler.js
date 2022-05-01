const fs = require('fs');
const https = require('https');
const path = require('path');
const socket = require("socket.io");
const Room = require("../models/room");
const crypto = require('crypto');
const User = require('../models/user');
const Profile = require('../models/profile');
const { RoomsHandler, ServerRoom } = require('./rooms');

const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '../', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../', 'cert.pem'))
}).listen(8002, function () {
    console.log("Room server has started on port 8002");
});

const io = socket(httpsServer);

let rooms = new RoomsHandler();

io.on('connection', (socket) => {

    socket.on("join-room", async (roomId, roomUserId, userId) => {

        socket.on("toggle-microphone", async () => {
            rooms.getRoom(roomId).toggleMicrophone(roomUserId);
        });

        socket.on("toggle-camera", async () => {
            rooms.getRoom(roomId).toggleCamera(roomUserId);
        });

        socket.on("toggle-board", async (targetRoomUserId) => {
            rooms.getRoom(roomId).toggleBoard(roomUserId, targetRoomUserId);
        });

        socket.on("admin-mute", async (targetRoomUserId) => {
            rooms.getRoom(roomId).toggleTalk(roomUserId, targetRoomUserId);
        });

        socket.on('toggle-move', async (targetRoomUserId) => {
            rooms.getRoom(roomId).toggleBoard(roomUserId, targetRoomUserId);
        });

        socket.on('move', async (move) => {
            rooms.getRoom(roomId).makeMove()
        });

        socket.on('position', async (position) => {
            rooms.getRoom(roomId).setPosition(roomUserId, position);
        });

        socket.on('disconnect', async () => {

        });

        rooms.getRoom(roomId).connect(roomUserId);
    });

    socket.on('ask-access', async (roomId, userId) => {
        let room = await Room.findOne({ roomId });

        if(room) {
            if(!rooms.getRoom(roomId)) {
                rooms.createRoom(room);
            }
        }

        if(room.admins.includes(userId)) {
            let profile = await Profile.findOne({ userId });
            rooms.getRoom(roomId).addAdmin(roomUserId, profile);
        }

        let profile = await Profile.findOne({ userId });
        rooms.getRoom(roomId).askAccess(profile, socket);
    });

    socket.on('admin-approved', async (roomId, roomUserId, targetRoomUserId) => {
        rooms.getRoom(roomId).giveAccess(roomUserId, targetRoomUserId);
    });

    socket.on('ban', async (roomId, roomUserId, targetRoomUserId) => {
        rooms.getRoom(roomId).ban(roomUserId, targetRoomUserId);
    });

});

module.exports = io;