import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import io from "socket.io-client";
import Config from "../../config.json";
import jwtDecode from "jwt-decode";
import Peer from "peerjs";
import Camera from "../Camera/Camera";

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {};
        this.stream = null;
        this.state.streams = [];
        this.peers = { };
    }

    async componentDidMount() {
        let userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        this.state.roomId = window.location.pathname.split("/")[2];

        const socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });

        const peer = new Peer(undefined, {
            host: '/',
            port: '8003'
        });

        socket.on('user-connected', (userId) => {
            this.connectToPeer(peer, userId, userStream);
        });

        socket.on('user-disconnected', userId => {
            if(this.peers[userId]) this.peers[userId].close()
        })


        peer.on('open', userId => {
            socket.emit('join-room', this.state.roomId, userId);

            peer.on('call', (call) => {
                call.answer(userStream);
    
                call.on('stream', (stream) =>{

                    call.on('close', ()=>{
                        console.log(stream);
                        this.state.streams.remove(stream);
                        this.setState({ });
                    })

                    this.state.streams.push(stream);
                    this.setState({ });
                });

            });

        });

        this.setState({ stream: userStream });
    }

    connectToPeer(peer, userId, stream) {
        const call = peer.call(userId, stream);
        this.peers[userId] = call;
        
        call.on('stream', userVideoStream => {
            this.state.streams.push(userVideoStream);
            console.log(this.state.streams);
            this.setState({ })
        })
    }

    render() {
        return <div>
            <div id="cameras" className="cameras">
                { (this.state.stream) ? <Camera stream={this.state.stream}></Camera> : null }
                {
                    this.state.streams.map(stream => {
                        return <Camera stream={stream}></Camera>;
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
