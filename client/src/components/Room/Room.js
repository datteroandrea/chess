import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import io from "socket.io-client";
import Config from "../../config.json";
import Peer from "peerjs";
import Camera from "../Camera/Camera";
import EditBoardModal from "../FreeBoard/EditBoardModal/EditBoardModal";
import MovesList from "../ComputerGame/MovesList/MovesList";
import axios from "axios";
import jwtDecode from "jwt-decode";

const colorOrder = ["#4fb4bf", "#4caf50", "#ffeb3b", "#ffa726", "#ff5f52"];

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.camera = React.createRef();
        this.moveList = React.createRef();
        this.editBoardModal = React.createRef();
        this.FENstring = React.createRef();
        this.state = {};
        this.stream = null;
        this.roomId = null;
        this.state.cameras = {};
        this.state.cameraRefs = {};
        this.peers = {};
        this.state.isVoteStarted = false;
        this.voteEnabled = false;
        this.studentMovesProposed = [];
        this.canMove = false;
    }

    async componentDidMount() {

        this.state.isAdmin = (await axios.get("/rooms/" + this.roomId + "/is-admin")).data.isAdmin;

        if (this.state.isAdmin) {
            this.board.current.setEditability(true);
        }

        this.state.socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });

        this.setState({ stream: await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) });

        const peer = new Peer(undefined, {
            host: '/',
            port: '8003'
        });

        peer.on('call', (call) => {
            call.answer(this.state.stream);
            this.peers[call.peer] = call;
            let camera;

            call.on('stream', (stream) => {
                this.state.cameraRefs[call.peer] = React.createRef();
                camera = <Camera ref={this.state.cameraRefs[call.peer]} key={call.peer} stream={stream} muted={true} enable={this.state.isAdmin} isAdmin={this.state.isAdmin} onToggleBoard={() => {
                    this.state.socket.emit("toggle-board", call.peer);
                }}></Camera>
                this.state.cameras[call.peer] = camera;
                this.setState({});
            });

        });

        this.state.socket.on('user-connected', (userId) => {
            const call = peer.call(userId, this.state.stream);
            this.peers[userId] = call;

            let camera;

            call.on('stream', (stream) => {
                this.state.cameraRefs[call.peer] = React.createRef();
                camera = <Camera ref={this.state.cameraRefs[call.peer]} key={userId} stream={stream} muted={true} enable={this.state.isAdmin} isAdmin={this.state.isAdmin} onToggleBoard={() => {
                    this.state.socket.emit("toggle-board", call.peer);
                }}></Camera>
                this.state.cameras[userId] = camera;
                this.setState({});
            });

            call.on('close', () => {
                delete (this.state.cameras[userId]);
                this.setState({})
            });
        });

        this.state.socket.on('user-disconnected', userId => {
            if (this.peers[userId]) {
                this.peers[userId].close();
                delete(this.peers[userId]);
            }
        });

        this.state.socket.on('admin-mute', () => {
            this.camera.current.toggleAdminMute();
        });

        this.state.socket.on('board-update', (position, move) => {
            // cambia la posizione della scacchiera
            this.board.current.loadFEN(position);
            // TODO: aggiugi la move nella movelist
        });

        this.state.socket.on('toggle-move', value => {
            this.voteEnabled = value;
            this.board.current.setEditability(value);
            if (!value) {
                this.showVoteResult();
            } else {
                this.studentMovesProposed = [];
            }
        });

        this.state.socket.on('toggle-mute', userSessionId => {
            // DA TESTARE
            this.state.cameraRefs[userSessionId].current.toggleMicrophone();
        });

        this.state.socket.on('toggle-camera', userSessionId => {
            // DA TESTARE
            this.state.cameraRefs[userSessionId].current.toggleCamera();
        });

        this.state.socket.on('toggle-board', () => {
            // DA TESTARE
            this.board.current.setEditability(true);
            this.canMove = true;
        });

        this.state.socket.on('toggle-stockfish', () => {
            // attiva/disattiva stockfish
        });

        this.state.socket.on('move', (u, m) => {
            this.addMoveToProposed(u, m);
        });

        this.state.socket.on('ban', () => {
            window.location.replace("/");
        });

        this.state.socket.on('ask-access', (userAccessId, email, username) => {
            // mostra che l'utente con il relativo userAccessId ha chiesto di entrare
            console.log(email, username);
            this.state.socket.emit("admin-approved", this.roomId, userAccessId, this.state.userId);
        })

        peer.on('open', userId => {
            this.state.socket.emit('join-room', this.roomId, userId, this.state.userId);
        });

        if (this.state.isAdmin) {
            this.camera.current.toggleBoard();
            this.camera.current.hideToggleBoard();
        }

    }

    render() {
        this.roomId = window.location.pathname.split("/")[2];
        this.state.userId = jwtDecode(localStorage.getItem("token")).userId;

        return <div>
            <div className="maincontent">
                <div id="cameras" className={this.state.isAdmin ? "cameras admin" : "cameras"}>
                    {(this.state.stream) ? <Camera ref={this.camera} stream={this.state.stream} muted={true} enable={true} isOwnCamera={true} isAdmin={this.state.isAdmin}
                        onToggleMute={() => {
                            this.state.socket.emit("toggle-mute");
                        }} onToggleCamera={() => {
                            this.state.socket.emit("toggle-camera");
                        }}></Camera> : null
                    }
                    {
                        Object.values(this.state.cameras).map(camera => {
                            return camera;
                        })
                    }
                </div>
                <div className="roomBoardContainer">
                    <Chessboard ref={this.board} playerColor="none" onMove={(move) => {
                        if (!this.state.isAdmin && this.voteEnabled) {
                            this.voteEnabled = false;
                            this.board.current.setEditability(false);
                            this.state.socket.emit("move", move);
                            this.addMoveToProposed("Me", move)
                        }
                    }} onFenUpdate={(fen, move) => {
                        if (!this.voteEnabled) {
                            this.state.socket.emit("board-update", fen, move);
                        }
                    }} />
                </div>
                <div className="roomSettingsContainer">
                    <MovesList ref={this.moveList}></MovesList>
                    {this.state.isAdmin ?
                        <div className="multi-button4">
                            <button onClick={() => this.undoMove()} className="mbutton4"><img src="../Assets/icons/prev.svg" alt="prev" className="img_icon"></img>Prev</button>
                            <button onClick={() => this.restartGame()} className="mbutton4"><img src="../Assets/icons/restart.svg" alt="restart" className="img_icon"></img>Restart</button>
                            <button onClick={() => this.toggleVote()} className={this.state.isVoteStarted ? "mbutton4 voteStarted" : "mbutton4 voteStopped"}><img src={this.state.isVoteStarted ? "../Assets/icons/endVote.svg" : "../Assets/icons/startVote.svg"} alt="vote" className="img_icon"></img>{this.state.isVoteStarted ? "End Voting" : "Start Voting"}</button>
                            <button onClick={() => this.rotateBoard()} className="mbutton4">Rotate<img src="../Assets/icons/rotate.svg" alt="rotate" className="img_icon"></img></button>
                            <button onClick={() => this.redoMove()} className="mbutton4">Next<img src="../Assets/icons/next.svg" alt="next" className="img_icon"></img></button>
                        </div>
                        : null}
                </div>
                <div className="fenLoaderContainer">
                    <div className="input-group bg-light">
                        <div className="input-group-prepend">
                            <p className="pre label">FEN:</p>
                        </div>
                        <input ref={this.FENstring} type="text" className="form-control bg-light" placeholder="insert FEN"></input>
                        <div className="input-group-append">
                            <button onClick={() => this.editBoardModal.current.enable()} className="btnIn" type="button">
                                Edit
                                <img src="../Assets/icons/edit_board.svg" alt="fen" className="img_icon_big"></img>
                            </button>
                            <button onClick={e => this.loadFEN()} className="btnIn" type="button">
                                Load
                                <img src="../Assets/icons/load_board.svg" alt="fen" className="img_icon_big"></img>
                            </button>
                        </div>
                    </div>
                </div>
                <EditBoardModal ref={this.editBoardModal} onFenLoad={fen => {
                    this.FENstring.current.value = fen;
                    this.loadFEN();
                }} />
            </div>
        </div>;
    }

    toggleAdminMute(userId) {
        this.state.socket.emit("admin-mute", userId);
    }

    toggleVote() {
        this.state.isVoteStarted = !this.state.isVoteStarted;
        this.setState({});
        this.state.socket.emit("toggle-move", this.state.isVoteStarted);
        if (!this.state.isVoteStarted) {
            this.showVoteResult();
            if (this.state.isAdmin || this.canMove) {
                this.board.current.setEditability(true);
            }
        } else {
            this.studentMovesProposed = [];
            if (this.state.isAdmin || this.canMove) {
                this.board.current.setEditability(false);
            }
        }
    }

    undoMove() {
        //TODO
    }

    redoMove() {
        //TODO
    }

    rotateBoard() {
        //TODO
    }

    restartGame() {
        //TODO
    }

    loadFEN() {
        let FENstring = this.FENstring.current.value;
        if (FENstring) {
            this.board.current.loadFEN(FENstring);
        }
    }

    addMoveToProposed(u, m) {
        let found = this.studentMovesProposed.find(e => e.move === m);
        if (found) {
            found.userList.push(u);
        } else {
            this.studentMovesProposed.push({ move: m, userList: [u] })
        }
    }

    showVoteResult() {
        if (this.studentMovesProposed.length > 0) {
            this.studentMovesProposed.sort((a, b) => b.userList.length - a.userList.length);
            let order = 0;
            let lastLength = this.studentMovesProposed[0].userList.length;
            [...this.studentMovesProposed].forEach((e) => {
                if (e.userList.length < lastLength) {
                    order++;
                    lastLength = e.userList.length;
                    console.log(order);
                }
                this.drawStudentMove(e.move.substring(0, 2), e.move.substring(2, 4), e.userList.length, order)
            });
        }
    }

    drawStudentMove(from, to, number, order) {

        let c = document.getElementById("arrowCanvas");

        let fromSquare = document.getElementById(from)
        let toSquare = document.getElementById(to);

        if (fromSquare && toSquare) {

            let color = "#ffffff"

            if (order > 4) {
                color = colorOrder[4];
            } else {
                color = colorOrder[order];
            }

            //variables to be used when creating the arrow
            let offset = vmin(5);
            let fromx = fromSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let fromy = fromSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let tox = toSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let toy = toSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let ctx = c.getContext("2d");
            let headlen = offset / 3;

            let angle = Math.atan2(toy - fromy, tox - fromx);

            //starting path of the arrow from the start square to the end square and drawing the stroke
            ctx.beginPath();
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            ctx.strokeStyle = color;
            ctx.lineWidth = offset / 3;
            ctx.stroke();

            //starting a new path from the head of the arrow to one of the sides of the point
            ctx.beginPath();
            ctx.moveTo(tox, toy);
            ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

            //path from the side point of the arrow, to the other side point
            ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));

            //path from the side point back to the tip of the arrow, and then again to the opposite side point
            ctx.lineTo(tox, toy);
            ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

            //draws the paths created above
            ctx.strokeStyle = color;
            ctx.lineWidth = offset / 2;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fill();

            //draw number
            let x = tox + ((fromx - tox) / 2);
            let y = toy + ((fromy - toy) / 2);
            let circle = new Path2D();
            circle.arc(x, y, offset / 2 + vmin(.2), 0, 2 * Math.PI);
            ctx.fill(circle);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.stroke(circle);
            ctx.fillStyle = "black";
            ctx.textAlign = "center"
            ctx.font = vmin(3.5) + 'px roboto';
            ctx.fillText(number, x, y + vmin(.4))
            ctx.font = vmin(1.8) + 'px roboto';
            let text;
            if (number === 1) {
                text = "vote";
            } else {
                text = "votes";
            }
            ctx.fillText(text, x, y + vmin(1.6))

            function vh(v) {
                var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                return (v * h) / 100;
            }

            function vw(v) {
                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                return (v * w) / 100;
            }

            function vmin(v) {
                return Math.min(vh(v), vw(v));
            }

        }
    }

}
