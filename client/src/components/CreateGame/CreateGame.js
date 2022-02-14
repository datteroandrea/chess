import './CreateGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';

export default class CreateGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
    }

    componentDidMount() {

    }

    createGame() {
        axios.post("http://localhost:3000/games/create", {

        }).then((game) => {
            window.location.replace("/games/" + game.game_id);
        });
    }

    render() {
        return <div className="container">
            <div className="row">
                <div className="col col-8">
                    { /** qui mettiamo la scacchiera di gioco */}
                    <Chessboard ref={this.board} />
                </div>
                <div className="col col-2">
                    { /** qui mettiamo il pannello con tutte le impostazioni della partità ad esempio:
                 * la durata, partità PvP o PvE ecc. */ }
                    <button className="btn btn-lg time-btn"><span><i className="fa fas fa-hourglass fa-fw"></i></span> 30 min</button>
                    <button className="btn btn-lg opponent-btn"><span><i className="fa fa-user fa-fw"></i></span> PvP</button>
                    { /** Il bottone Rated va mostrato soltanto su partite PvP  */}
                    <button className="btn btn-lg opponent-btn"><span><i className="fa fa-trophy fa-fw"></i></span> Rated</button>
                    { /** Il bottone Color va mostrato soltanto su partite PvE fai che il colore del bottone diventa bianco o nero  */}
                    <button className="btn btn-lg opponent-btn"><span><i className="fa fa-flag fa-fw"></i></span> Color</button>
                    <button className="btn btn-lg play-btn">Create Game</button>
                </div>
            </div>
        </div>;
    }

}
