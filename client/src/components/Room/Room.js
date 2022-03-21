import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {};
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
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
                <div className="camera"></div>
            </div>
            <div className="maincontent">
                <div className="boardContainer">
                    <Chessboard ref={this.board} />
                </div>
                <div className="panel">

                </div>
            </div>
        </div>;
    }

}
