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
        this.state = {
            playerColor: "white"
        };
    }

    async componentDidMount() {
        this.socket = new WebSocket("ws://" + Config.address + ':8001');

        this.socket.onopen = async (event) => {
            console.log("Connection created")
            let game = (await axios.post("/games/" + this.gameId + "/play")).data;

            this.socket.send(JSON.stringify({
                token: this.token,
                gameId: this.gameId
            })); 

            game.moves.forEach((move) => {
                let promotion = move.substring(4, 5);
                this.board.current.makeMove(move.substring(0, 2), move.substring(2, 4), promotion, false);
            });

            this.setState({
                game: game,
                playerColor: this.userId === game.blackPlayerId ? "black" : "white"
            });

            if (this.state.playerColor === "black") {
                this.board.current.rotateBoard();
            }
        };

        this.socket.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if (message.type === "move") {
                let promotion = message.move.substring(4, 5);
                this.board.current.makeMove(message.move.substring(0, 2), message.move.substring(2, 4), promotion, false);
                this.timer.current.startTimer(message.time);
            }

            if (message.type === "win") {
                console.log(message);
            }
        }

        this.socket.onclose = (event) => {
            console.log(event);
        }
    }

    render() {
        this.token = localStorage.getItem("token");
        this.gameId = window.location.pathname.split("/")[2];
        this.userId = jwtDecode(this.token).user_id;

        return <div style={{ marginLeft: 20 }}>
            <Timer ref={this.timer} userId={this.userId} gameId={this.gameId}></Timer>
            <Chessboard ref={this.board} playerColor={this.state.playerColor} onMove={(move) => {
                    this.socket.send(JSON.stringify({
                        token: this.token,
                        gameId: this.gameId, type: "move", move: move
                    }));
                    this.timer.current.stopTimer();
                }} />
        </div>;
    }

}