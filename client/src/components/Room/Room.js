import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import io from "socket.io-client";
import Config from "../../config.json";
import Peer from "peerjs";
import Camera from "../Camera/Camera";
import EditBoardModal from "../FreeBoard/EditBoardModal/EditBoardModal";
import axios from "axios";
import jwtDecode from "jwt-decode";

const colorForQuantity = ["#ff5f52", "#ffa726", "#ffeb3b", "#4caf50", "#4fb4bf"];

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.editBoardModal = React.createRef();
        this.FENstring = React.createRef();
        this.state = {};
        this.stream = null;
        this.roomId = null;
        this.state.cameras = {};
        this.camera = React.createRef();
        this.peers = {};
        this.studentMovesProposed = [];
    }

    async componentDidMount() {
        this.roomId = window.location.pathname.split("/")[2];

        this.state.isAdmin = (await axios.get("/rooms/" + this.roomId + "/admin")).data.isAdmin;
        if(this.state.isAdmin) this.board.current.setEditability(true);

        this.state.socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });

        this.state.userId = jwtDecode(localStorage.getItem("token")).userId;

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
                camera = <Camera stream={stream} muted={true} enable={this.state.isAdmin}></Camera>
                this.state.cameras[call.peer] = camera;
                this.setState({});
            });

        });

        this.state.socket.on('user-connected', (userId) => {
            const call = peer.call(userId, this.state.stream);
            this.peers[userId] = call;

            let camera;

            call.on('stream', (stream) => {
                camera = <Camera stream={stream} muted={true} enable={this.state.isAdmin}></Camera>
                this.state.cameras[userId] = camera;
                this.setState({});
            });

            call.on('close', () => {
                delete(this.state.cameras[userId]);
                this.setState({})
            });
        });

        this.state.socket.on('user-disconnected', userId => {
            if (this.peers[userId]) {
                this.peers[userId].close();
            }
        });

        this.state.socket.on('admin-mute', ()=>{
            this.camera.current.toggleAdminMute();
        });

        this.state.socket.on('board-update', (position) => {
            // cambia la posizione della scacchiera
            this.board.current.loadFEN(position);
        });

        this.state.socket.on('toggle-move', state => {
            this.board.current.setEditability(state);
        });

        this.state.socket.on('toggle-stockfish', ()=>{
            // attiva/disattiva stockfish
        });

        this.state.socket.on('move', (u, m) => {
            let found = this.studentMovesProposed.find(e => e.move === m);
            if(found){
                found.userList.push(u);
            }else{
                this.studentMovesProposed.push({move:m , userList:[u]})
            }
        });

        peer.on('open', userId => {
            this.state.socket.emit('join-room', this.roomId, userId, this.state.userId);
        });

        if(this.state.isAdmin){
            this.camera.current.toggleBoard();
            this.camera.current.hideToggleBoard();
        }

    }

    render() {
        return <div>
            <div className="maincontent">
                <div id="cameras" className={this.state.isAdmin ? "cameras admin" : "cameras"}>
                    {(this.state.stream) ? <Camera ref={this.camera} stream={this.state.stream} muted={true} enable={true}></Camera> : null}
                    {
                        Object.values(this.state.cameras).map(camera => {
                            return camera;
                        })
                    }
                </div>
                <div className="roomBoardContainer">
                    <Chessboard ref={this.board} playerColor="none" onMove={(move) => {
                        this.board.current.setEditability(false);
                        this.state.socket.emit("move", move);
                    }} onFenUpdate={(fen) => {
                        this.state.socket.emit("board-update", fen);
                    }}/>
                </div>
                <div className="roomSettingsContainer">
                    {
                        this.state.isAdmin ? <button className="btn btn-primary btn-outline" onClick={() => {
                            this.state.socket.emit("toggle-move", true);
                        }}>Toggle Move</button> : null
                    }
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

    loadFEN() {
        let FENstring = this.FENstring.current.value;
        if (FENstring) {
            this.board.current.loadFEN(FENstring);
        }
    }

    drawStudentsMovesResult(from, to, number) {

        let c = document.getElementById("arrowCanvas");

        let fromSquare = document.getElementById(from)
        let toSquare = document.getElementById(to);

        if(fromSquare && toSquare){

            let color = "#ffffff"

            if(number > 5){
                color = colorForQuantity[4];
            }else{
                color = colorForQuantity[number-1];
            }

            //variables to be used when creating the arrow
            let offset = vmin(5);
            let fromx = fromSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let fromy = fromSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let tox = toSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let toy = toSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let ctx = c.getContext("2d");
            let headlen = offset/3;

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
            let x = tox + ((fromx - tox)/2);
            let y = toy + ((fromy - toy)/2);
            let circle = new Path2D();
            circle.arc(x, y, offset/2+vmin(.2), 0, 2 * Math.PI);
            ctx.fill(circle);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.stroke(circle);
            ctx.fillStyle = "black";
            ctx.textAlign = "center"
            ctx.font = vmin(3.5) + 'px roboto';
            ctx.fillText(number, x, y+vmin(.4))
            ctx.font = vmin(1.8) + 'px roboto';
            ctx.fillText("votes", x, y+vmin(1.6))

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
