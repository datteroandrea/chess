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
import RequestAccessModal from "./RequestAccessModal";

const colorOrder = ["#4fb4bf", "#4caf50", "#ffeb3b", "#ffa726", "#ff5f52"];

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.moveList = React.createRef();
        this.editBoardModal = React.createRef();
        this.FENstring = React.createRef();
        this.requestAccessModal = React.createRef();
        this.state = {
            cameras: {},
            cameraRefs: {},
            isVoteStarted: false,
        };
        this.roomId = null;
        this.peers = {};
        this.voteEnabled = false;
        this.studentMovesProposed = [];
        this.canMove = false;
        this.socket = null;
        this.isAdmin = null;
    }

    async componentDidMount() {

        this.isAdmin = (await axios.get("/rooms/" + this.roomId + "/is-admin")).data.isAdmin;
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        let cameraRef = React.createRef();
        let camera = <Camera key={this.userId} ref={cameraRef} stream={this.stream} muted={this.isAdmin ? false : true} enable={true} isOwnCamera={true} isAdmin={this.isAdmin} onToggleMicrophone={() => {
            console.log("AAAAA")
            this.socket.emit("toggle-mute");
        }}></Camera>;

        this.state.cameras[this.userId] = camera;
        this.state.cameraRefs[this.userId] = cameraRef;

        this.setState((previousState) => {
            let cameras = Object.assign({}, previousState.cameras);
            let cameraRefs = Object.assign({}, previousState.cameraRefs);
            cameras[this.userId] = camera;
            cameraRefs[this.userId] = camera;
            return { ...previousState, cameras, cameraRefs };
        })

        if (this.isAdmin && this.stream) {
            this.board.current.setEditability(true);
            this.state.cameraRefs[this.userId].ref.current.toggleBoard();
            this.state.cameraRefs[this.userId].ref.current.hideToggleBoard();
        }

        const peer = new Peer(undefined, {
            host: '/',
            port: '8003'
        });

        this.socket.on('user-connected', (userSessionId) => {
            const call = peer.call(userSessionId, this.stream);
            this.peers[userSessionId] = call;

            call.on('stream', (stream) => {
                let cameraRef = React.createRef();
                let camera = <Camera ref={cameraRef} key={userSessionId} stream={stream} muted={false} enable={this.isAdmin} isAdmin={this.isAdmin} onToggleBoard={() => {
                    this.socket.emit("toggle-board", userSessionId);
                }} onToggleMicrophone={() => {
                    this.socket.emit("toggle-mute");
                }} onToggleAdminMicrophone={() => {
                    this.socket.emit("admin-mute", userSessionId);
                }}></Camera>
                let cameras = Object.assign({}, this.state.cameras);
                cameras[userSessionId] = camera;
                let cameraRefs = Object.assign({}, this.state.cameraRefs);
                cameraRefs[userSessionId] = cameraRef;
                this.setState({
                    cameras: cameras,
                    cameraRefs: cameraRefs
                });
            });

            call.on('close', () => {
                let cameras = Object.assign({}, this.state.cameras);
                let cameraRefs = Object.assign({}, this.state.cameraRefs);
                delete (cameras[userSessionId]);
                delete (cameraRefs[userSessionId]);
                this.setState({
                    cameras: cameras,
                    cameraRefs: cameraRefs
                })
            });
        });

        this.socket.on('user-disconnected', userSessionId => {
            if (this.peers[userSessionId]) {
                this.peers[userSessionId].close();
                delete (this.peers[userSessionId]);
            }
        });

        this.socket.on('admin-mute', (userSessionId) => {
            console.log("ADMIN MUTE RECEIVED")
            this.state.cameraRefs[userSessionId].current.toggleAdminMute();
        });

        this.socket.on('board-update', (position, move) => {
            // cambia la posizione della scacchiera
            if (this.board.current.fen !== position) {
                console.log("Update pos: ", position);
                this.board.current.loadFEN(position);
            }
            // TODO: aggiugi la move nella movelist
        });

        this.socket.on('toggle-move', value => {
            this.voteEnabled = value;
            this.board.current.setEditability(value);
            if (!value) {
                this.showVoteResult();
            } else {
                this.studentMovesProposed = [];
            }
        });

        this.socket.on('toggle-mute', userSessionId => {
            console.log(userSessionId)
            console.log(this.state.cameraRefs)
            this.state.cameraRefs[userSessionId].current.toggleMicrophone();
        });

        this.socket.on('toggle-camera', userSessionId => {
            this.state.cameraRefs[userSessionId].current.toggleCamera();
        });

        this.socket.on('toggle-board', () => {
            // DA TESTARE
            this.canMove = !this.canMove;
            this.board.current.setEditability(this.canMove);
        });

        this.socket.on('toggle-stockfish', () => {
            // attiva/disattiva stockfish
        });

        this.socket.on('move', (u, m) => {
            console.log("Moved: " + m);
            this.addMoveToProposed(u, m);
        });

        this.socket.on('ban', () => {
            window.location.replace("/");
        });

        this.socket.on('ask-access', (userAccessId, email, username) => {
            this.requestAccessModal.current.addRequest(userAccessId, email, username)
        });

        this.socket.on('joined-room', (position) => {
            //this.setState({})
            if (position !== "") {
                console.log("Starting pos: ", position);
                this.board.current.loadFEN(position);
            }
        });

        peer.on('open', userSessionId => {

            peer.on('call', (call) => {
                call.answer(this.stream);
                this.peers[userSessionId] = call;
    
                call.on('stream', (stream) => {
                    let cameraRef = React.createRef();
                    let camera = <Camera ref={this.state.cameraRefs[userSessionId]} key={userSessionId} stream={stream} muted={false} enable={this.isAdmin} isAdmin={this.isAdmin} onToggleBoard={() => {
                        this.socket.emit("toggle-board", userSessionId);
                    }} onToggleAdminMicrophone={() => {
                        this.socket.emit("admin-mute", userSessionId);
                    }}></Camera>
                    let cameras = Object.assign({}, this.state.cameras);
                    cameras[userSessionId] = camera;
                    let cameraRefs = Object.assign({}, this.state.cameraRefs);
                    cameraRefs[userSessionId] = cameraRef;
                    this.setState({
                        cameras: cameras,
                        cameraRefs: cameraRefs
                    });
                });
    
            });

            this.socket.emit('join-room', this.roomId, userSessionId, this.userId);
        });
    }

    render() {
        this.roomId = window.location.pathname.split("/")[2];
        this.userId = jwtDecode(localStorage.getItem("token")).userId;

        if (!this.socket) {
            this.socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });
        }

        return <div>
            <div className="maincontent">
                <RequestAccessModal ref={this.requestAccessModal} onConfirm={(userAccessId) => {
                    this.socket.emit('admin-approved', this.roomId, userAccessId, this.userId);
                }} onReject={(userAccessId) => {
                    this.socket.emit('admin-rejected', this.roomId, userAccessId, this.userId);
                }}></RequestAccessModal>
                <div id="cameras" className={this.isAdmin ? "cameras admin" : "cameras"}>
                    {
                        Object.values(this.state.cameras).map(camera => {
                            return camera;
                        })
                    }
                </div>
                <div className="roomBoardContainer">
                    <Chessboard ref={this.board} playerColor="none" onMove={(move) => {
                        if (!this.isAdmin && this.voteEnabled) {
                            this.voteEnabled = false;
                            this.board.current.setEditability(false);
                            this.socket.emit("move", move);
                            this.addMoveToProposed("Me", move)
                        }
                    }} onFenUpdate={(fen, move) => {
                        if (!this.voteEnabled) {
                            this.socket.emit("board-update", fen, move);
                        }
                    }} />
                </div>
                <div className="roomSettingsContainer">
                    <MovesList ref={this.moveList}></MovesList>
                    {this.isAdmin ?
                        <div className="multi-button4">
                            <button onClick={() => this.undoMove()} className="mbutton4"><img src="../Assets/icons/prev.svg" alt="prev" className="img_icon"></img>Prev</button>
                            <button onClick={() => this.restartGame()} className="mbutton4"><img src="../Assets/icons/restart.svg" alt="restart" className="img_icon"></img>Restart</button>
                            <button onClick={() => this.openRequestAccessModal()} className={this.state.isVoteStarted ? "mbutton4 voteStarted" : "mbutton4 voteStopped"}>Access List</button>
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

    openRequestAccessModal() {
        this.requestAccessModal.current.open();
    }

    toggleVote() {
        this.state.isVoteStarted = !this.state.isVoteStarted;
        this.setState({});
        this.socket.emit("toggle-move", this.state.isVoteStarted);
        if (!this.state.isVoteStarted) {
            this.showVoteResult();
            if (this.isAdmin || this.canMove) {
                this.board.current.setEditability(true);
            }
        } else {
            this.studentMovesProposed = [];
            if (this.isAdmin || this.canMove) {
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