import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';
import io from "socket.io-client";
import Config from "../../config.json";
import jwtDecode from "jwt-decode";

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {};
    }

    componentDidMount() {
        this.state.roomId = window.location.pathname.split("/")[2];

        const socket = io("https://" + Config.address + ":8002", { transports : ['websocket'] });

        socket.on('user-connected', (userId)=>{
            alert('User connected ' + userId);
        });

        socket.emit('join-room', this.state.roomId, jwtDecode(localStorage.getItem("token")).userId);

        

        this.setState({ });
    }

    render() {
        return <div>
            <div className="cameras">
                <div className="camera">
                    <div className="controls">
                        <span className="input-group-text bg-transparent border-0 hidden" id="basic-addon1">
                            <img src="../Assets/icons/microphone-solid.svg" style={{ width: 20, height: 20 }}></img>
                        </span>
                        <span className="input-group-text bg-transparent border-0 hidden" id="basic-addon1">
                            <img src="../Assets/icons/video-solid.svg" style={{ width: 20, height: 20 }}></img>
                        </span>
                    </div>
                </div>
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
