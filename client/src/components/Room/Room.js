import "./Room.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';

export default class Room extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = { };
    }

    render() {
        return <div className="mainContainer">
            <div className="boardContainerCreate">
                <Chessboard ref={this.board} />
            </div>
            <div className="buttonsContainerCreate">
                
            </div>
        </div>;
    }

}
