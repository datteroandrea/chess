import "./FreeBoard.css";
import Chessboard from "../Chessboard/Chessboard";
import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const { Component } = React;

export default class FreeBoard extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
    }

    render() {
        return <div className="FreeboardContainer">

            <div className="BoardContainer">
                <Chessboard ref={this.board} />
            </div>

            <div className="StockfishContainer">
                <h3>STOCKFISH</h3>
            </div>

            <div className="NavigatePositionContainer">
                <h3>NAVIGATE POSITION</h3>
                <div className="input-group">
                    <input id="FENstring" type="text" className="form-control" placeholder="FEN string..."></input>
                    <div className="input-group-append">
                        <button onClick={e => this.loadFEN()} className="btn btn-secondary btn-small" type="button">Load</button>
                    </div>
                </div>
            </div>

        </div>;
    }

    loadFEN(){

        let input = document.getElementById("FENstring")

        if(input){
            let FENstring = input.value;
            this.board.current.loadFEN(FENstring);
            input.value = "";
        }

    }

}