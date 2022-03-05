import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import "./MultiplayerGame.css";
import axios from 'axios';
import Config from "../../config.json";
import jwtDecode from "jwt-decode";
import Timer from "../Timer/Timer";
import MediaQuery from 'react-responsive';

export default class MultiplayerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.timer = React.createRef();
        this.state = {};
    }

    async componentDidMount() {
        this.token = localStorage.getItem("token");
        this.gameId = window.location.pathname.split("/")[2];

        let userId = jwtDecode(this.token).user_id;

        let game = await axios.post("/games/" + this.gameId + "/play");

        game.data.moves.forEach((move) => {
            let promotion = move.substring(4, 5);
            this.board.current.makeMove(move.substring(0, 2), move.substring(2, 4), promotion, false);
        });

        this.setState({
            game: game.data,
            playerColor: userId === game.data.blackPlayerId ? "black" : "white"
        });
    }

    openSocketConnection() {
        this.socket = new WebSocket("ws://" + Config.address + ':8001');

        this.socket.onopen = (event) => {
            this.socket.send(JSON.stringify({
                token: this.token,
                gameId: this.gameId
            }));
        };

        this.socket.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if (message.type === "move") {
                let promotion = message.move.substring(4, 5);
                this.board.current.makeMove(message.move.substring(0, 2), message.move.substring(2, 4), promotion, false);
                this.timer.current.startTimer();
            }
        }
    }

    render() {

        if (this.state.game) {
            if (this.state.playerColor === 'black') {
                this.board.current.rotateBoard();
            }
            this.openSocketConnection();
        }

        return <div>
            <MediaQuery minWidth={1201}>
                <div className="row">
                    <div className="col col-8">
                        <Chessboard ref={this.board} playerColor={this.state.playerColor} onMove={(move) => {
                            this.socket.send(JSON.stringify({
                                token: this.token,
                                gameId: this.gameId, type: "move", move: move
                            }));
                            this.timer.current.stopTimer();
                        }} />
                    </div>
                    <div className="col col-2">
                        <Timer ref={this.timer} seconds={5}></Timer>
                    </div>
                </div>
            </MediaQuery>
            <MediaQuery maxWidth={1200}>
                <div className="col">
                    <div className="row">
                        <Timer ref={this.timer} seconds={5}></Timer>
                    </div>
                    <div className="row">
                        <Chessboard ref={this.board} playerColor={this.state.playerColor} onMove={(move) => {
                            this.socket.send(JSON.stringify({
                                token: this.token,
                                gameId: this.gameId, type: "move", move: move
                            }));
                            this.timer.current.stopTimer();
                        }} />
                    </div>
                </div>
            </MediaQuery>
        </div>;
    }

}