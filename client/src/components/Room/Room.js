import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import io from "socket.io-client";
import Config from "../../config.json";
import Peer from "peerjs";
import Camera from "../Camera/Camera";

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {};
        this.stream = null;
        this.roomId = null;
        this.state.cameras = {};
        this.peers = { };
    }

    async componentDidMount() {
        this.setState({ stream: await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) });
        this.roomId = window.location.pathname.split("/")[2];

        const socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });

        const peer = new Peer(undefined, {
            host: '/',
            port: '8003'
        });

        peer.on('call', (call) => {
            call.answer(this.state.stream);
            let camera;

            call.on('stream', (stream) =>{
                camera = <Camera stream={stream}></Camera>
                this.state.cameras[call.peer] = camera;
                this.setState({ });
            });

        });

        socket.on('user-connected', (userId) => {
            this.connectToPeer(peer, userId, this.state.stream);
        });

        socket.on('user-disconnected', userId => {
            if(this.peers[userId]) this.peers[userId].close()
        })

        peer.on('open', userId => {
            socket.emit('join-room', this.roomId, userId);
        });
    }

    connectToPeer(peer, userId, stream) {
        const call = peer.call(userId, stream);

        let camera;

        call.on('stream', (stream) =>{
            camera = <Camera stream={stream}></Camera>
            this.state.cameras[call.peer] = camera;
            this.setState({ });
        });

        call.on('close', () => {
            delete(this.state.cameras[call.peer]);
            this.setState({ })
        });

        this.peers[userId] = call;
    }

    render() {
        return <div>
            <div id="cameras" className="cameras">
                { (this.state.stream) ? <Camera stream={this.state.stream}></Camera> : null }
                {
                    Object.values(this.state.cameras).map(camera => {
                        return camera;
                    })
                }
            </div>
            <div className="maincontent">
                <div className="roomBoardContainer">
                    <Chessboard ref={this.board} />
                </div>
                <div className="panel">

                </div>
            </div>
        </div>;
    }

}
