import "./CreateRoom.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';

export default class CreateRoom extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {
            roomVisbility: "Private",
        };
    }

    handleRoomVisibility() {
        this.setState({
            roomVisbility: (this.state.roomVisbility === "Public") ? "Private" : "Public"
        });
    }

    createRoom() {
        axios.post("/rooms/create", this.state).then((room) => {
            window.location.replace("/rooms/" + room.data.roomId);
        });
    }

    render() {
        return <div className="mainContainer">
            <div className="boardContainerCreate">
                <Chessboard ref={this.board} />
            </div>
            <div className="buttonsContainerCreate">
                <ul className="list-group">
                    <li className="list-group-item">
                        <button className="btn btn-lg time-btn" onClick={() => { this.handleRoomVisibility() }}><span><i className="fa fas fa-hourglass fa-fw"></i></span>{this.state.roomVisbility} Room</button>
                        <div className="time-box hide">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                    <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                </span>
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <button className="btn btn-lg play-btn" onClick={() => { this.createRoom() }}>Create Room</button>
                    </li>
                </ul>
            </div>
        </div>;
    }

}
