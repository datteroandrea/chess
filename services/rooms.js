const crypto = require('crypto');
const User = require('../models/user');
const Room = require("../models/room");

class ServerRoom {

    constructor(room) {
        this.admins = { };
        this.allowedUsers = { };
        this.bannedUsers = { };
        this.room = room;
        this.connectedUsers = { };
        this.usersWaitingAccess = { };
        this.position = "";
        this.moves = [];
    }

    addAdmin(roomUserId, profile) {
        this.admins[roomUserId] = profile;
    }

    askAccess(profile, socket) {
        let roomUserId = crypto.randomUUID();

        if(!this.room.isPublic && !this.allowedUsers[roomUserId]) {
            this.usersWaitingAccess[roomUserId] = { profile, socket };
            return;
        }

        return socket?.emit("admin-approved", this.room.roomId, roomUserId);
    }

    ban(adminId, roomUserId) {
        if(this.room.admins[adminId]) {
            let { profile } = this.allowedUsers[roomUserId];
            let { socket } = this.connectedUsers[roomUserId];
            this.bannedUsers[roomUserId] = { profile };
            socket?.emit("ban", this.room.roomId);
            delete(this.allowedUsers[roomUserId]);
        }
    }

    connect(roomUserId) {
        let { socket } = this.connectedUsers[roomUserId];
        socket.emit("joined-room", { roomUserId, position: this.position, moves: this.moves, connectedUsers: this.connectedUsers });
        socket.join(this.room.roomId);
        socket.to(this.room.roomId)?.emit('user-connected', roomUserId);
    }

    disconnect(roomUserId) {
        let { socket } = this.connectedUsers[roomUserId];
        socket?.to(this.room.roomId)?.emit("user-disconnected", roomUserId);
        delete(this.connectedUsers[roomUserId]);
    }

    giveAccess(adminId, roomUserId) {
        if(this.room.admins[adminId]) {
            let { profile, socket } = this.usersWaitingAccess[roomUserId];
            this.allowedUsers[roomUserId] = { profile };
            this.connectedUsers[roomUserId] = { socket, canTalk: false, microphone: true, camera: true, canMove: false, boardEnabled: false };
            delete(this.usersWaitingAccess[roomUserId]);
            socket?.emit("admin-approved", this.room.roomId, roomUserId);
        }
    }

    makeMove(roomUserId, move) {
        let { socket } = this.connectedUsers[roomUserId];
        if(this.room.admins[roomUserId] || this.connectedUsers[roomUserId].boardEnabled) {
            this.moves.push(move);
        } else if(this.connectedUsers[roomUserId].canMove) {
            this.connectedUsers[roomUserId].canMove = false;
        }
        socket?.to(this.room.roomId)?.emit('move', { approvedMove: this.room.admins[roomUserId] || this.connectedUsers[roomUserId].boardEnabled, move });
    }

    // utilizzato per permettere ai partecipanti della stanza di provare ad eseguire la mossa migliore
    startPoll(adminId) {
        if(this.room.admins[adminId]) {
            let { socket } = this.connectedUsers[adminId];
            Object.keys(this.connectedUsers).forEach((roomUserId) => {
                this.connectedUsers[roomUserId].canMove = true;
            });
            socket?.to(this.room.roomId)?.emit('start-poll', position);
        }
    }

    setPosition(adminId, position) {
        if(this.room.admins[adminId]) {
            let { socket } = this.connectedUsers[adminId];
            this.moves = [];
            socket?.to(this.room.roomId)?.emit('position', position);
        }
    }

    toggleBoard(adminId, roomUserId) {
        if(this.room.admins[adminId]) {
            let { socket } = this.connectedUsers[roomUserId];
            this.connectedUsers[roomUserId].boardEnabled = !this.connectedUsers[roomUserId].boardEnabled;
            socket?.emit('toggle-board', roomUserId);
        }
    }

    toggleCamera(roomUserId) {
        let { socket } = this.connectedUsers[roomUserId];
        this.connectedUsers[roomUserId].camera = !this.connectedUsers[roomUserId].camera;
        socket?.to(this.room.roomId)?.emit('toggle-camera', roomUserId);
    }

    toggleMicrophone(roomUserId) {
        let { socket } = this.connectedUsers[roomUserId];
        this.connectedUsers[roomUserId].microphone = !this.connectedUsers[roomUserId].microphone;
        socket?.to(this.room.roomId)?.emit('toggle-mute', roomUserId);
    }

    toggleTalk(adminId, roomUserId) {
        if(this.room.admins[adminId]) {
            let { socket } = this.admins[adminId];
            this.connectedUsers[roomUserId].canTalk = !this.connectedUsers[roomUserId].canTalk;
            socket?.to(this.room.roomId)?.emit('admin-mute', roomUserId);
        }
    }

}

class RoomsHandler {

    constructor() {
        this.rooms = {};
    }

    createRoom(room) {
        this.rooms[room.roomId] = new Room(room);
        return this.rooms[room.roomId];
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    removeGame(roomId) {
        delete(this.rooms[roomId]);
    }

}

module.exports = {
    RoomsHandler,
    ServerRoom
}