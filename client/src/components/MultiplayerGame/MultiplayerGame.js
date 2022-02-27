import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import "./MultiplayerGame.css";
import axios from 'axios';
import Config from "../../config.json";
import jwtDecode from "jwt-decode";

export default class MultiplayerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {
            playerColor: "w"
        };
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
            playerColor: userId === game.data.blackPlayerId ? "b" : "w"
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
            }
        }
    }

    render() {

        if (this.state.game) {
            this.openSocketConnection();
        }
        
        return <div className="row">
            <div className="col col-8">
                <Chessboard ref={this.board} playerColor={this.state.playerColor} onMove={(move) => {
                    this.socket.send(JSON.stringify({
                        token: this.token,
                        gameId: this.gameId, type: "move", move: move
                    }));
                }} />
            </div>
            <div className="col col-2">
                <div>

                </div>
            </div>
        </div>;
    }

}