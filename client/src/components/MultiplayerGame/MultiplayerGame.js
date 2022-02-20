import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import "./MultiplayerGame.css";

export default class MultiplayerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.socket = new WebSocket("ws://127.0.0.1:4001");
    }

    componentDidMount() {
        this.socket.onopen = (event) => {
            this.socket.send(JSON.stringify({
                token: localStorage.getItem("token")
            }));
        };

        this.socket.onmessage = (event) => {
            console.log(event.data);
        }
    }

    render() {
        return <div className="row">
            <div className="col col-8">
                <Chessboard ref={this.board} />
            </div>
            <div className="col col-2">
                <div>
                    
                </div>
            </div>
        </div>;
    }

}