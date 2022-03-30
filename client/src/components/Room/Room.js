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
    }

    // TODO: aggiungi opzione per abilitare/disabilitare stockfish
    // TODO: aggiungi che se sei admin puoi modificare la posizione della scacchiera
    async componentDidMount() {
        this.roomId = window.location.pathname.split("/")[2];

        this.state.isAdmin = (await axios.get("/rooms/" + this.roomId + "/admin")).data.isAdmin;

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
                camera = <Camera stream={stream} muted={false}></Camera>
                this.state.cameras[call.peer] = camera;
                this.setState({});
            });

        });

        this.state.socket.on('user-connected', (userId) => {
            const call = peer.call(userId, this.state.stream);
            this.peers[userId] = call;
            console.log("USER CONNECTED: " + userId);

            let camera;

            call.on('stream', (stream) => {
                camera = <Camera stream={stream} muted={false}></Camera>
                this.state.cameras[userId] = camera;
                this.setState({});
            });

            call.on('close', () => {
                delete(this.state.cameras[userId]);
                this.setState({})
            });
        });

        this.state.socket.on('user-disconnected', userId => {
            console.log("USER DISCONNECTED: " + userId);
            if (this.peers[userId]) {
                this.peers[userId].close();
            }
        });

        this.state.socket.on('admin-mute', ()=>{
            this.camera.current.toggleAdminMute();
        });

        this.state.socket.on('board-update', (position) => {
            // cambia la posizione della scacchiera
        });

        this.state.socket.on('toggle-stockfish', ()=>{
            // attiva/disattiva stockfish
        });

        peer.on('open', userId => {
            this.state.socket.emit('join-room', this.roomId, userId, this.state.userId);
        });

    }

    render() {
        return <div>
            <div className="maincontent">
                <div id="cameras" className="cameras">
                    {(this.state.stream) ? <Camera ref={this.camera} stream={this.state.stream} muted={true}></Camera> : null}
                    {
                        Object.values(this.state.cameras).map(camera => {
                            return camera;
                        })
                    }
                </div>
                <div className="roomBoardContainer">
                    <Chessboard ref={this.board} />
                </div>
                <div className="roomSettingsContainer">
                    {this.state.isAdmin ?
                        <div>
                            <button onClick={()=>{
                                this.toggleAdminMute(this.state.userId);
                            }}>Toggle Mute</button>
                        </div> :
                        <div>

                        </div>
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

}
