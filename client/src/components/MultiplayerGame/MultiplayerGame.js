import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import "./MultiplayerGame.css";
import axios from 'axios';
import Config from "../../config.json";

export default class MultiplayerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
    }

    async componentDidMount() {
        this.token = localStorage.getItem("token");
        this.gameId = window.location.pathname.split("/")[2];

        // console.log(this.token, this.gameId);
        // controlla se può giocare o meno (controlla se uno dei 2 id corrisponde all'id dell'utente corrente)
        // inoltre posiziona la scacchiera eseguendo in successione le mosse contenute in response.data.moves
        let response = await axios.post("/games/" + this.gameId + "/play");

        // console.log(response.data);

        this.socket = new WebSocket("ws://"+Config.address+':8001');

        this.socket.onopen = (event) => {
            this.socket.send(JSON.stringify({
                token: this.token,
                gameId: this.gameId
            }));
        };

        this.socket.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if (message.type === "move") {
                // esegui la mossa nella scacchiera
                this.board.current.makeMove(message.move.substring(0, 2), message.move.substring(2, 4));
            }
        }
    }

    render() {
        return <div className="row">
            <div className="col col-8">
                <Chessboard ref={this.board} onMove={(move) => {
                    //console.log(move);
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