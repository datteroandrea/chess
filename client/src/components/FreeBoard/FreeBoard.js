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
        this.stockfish_out = React.createRef();
        this.loadStockfishEngine();
    }

    render() {

        return <div className="FreeboardContainer">

            <div className="BoardContainer">
                <Chessboard ref={this.board} onMove={(fen) => {
                    document.getElementById("FENstring").value = fen;
                    this.stockfish.postMessage("position fen " + fen);
                    this.stockfish.postMessage("go depth 16")
                }}/>
            </div>

            <div className="StockfishContainer">
                <div className="divTitle">STOCKFISH</div>
                <div ref={this.stockfish_out} className="alert alert-secondary" role="alert">
                    Loading stockfish...
                </div>
            </div>

            <div className="NavigatePositionContainer">
                <div className="divTitle">NAVIGATE POSITION</div>
                <div className="input-group bg-light">
                    <div className="input-group-prepend">
                        <p className="pre label">FEN:</p>
                    </div>
                    <input id="FENstring" type="text" className="form-control bg-light" placeholder="FEN string..." defaultValue="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"></input>
                    <div className="input-group-append">
                        <button onClick={e => this.loadFEN()} className="btn btn-secondary btn-small" type="button">Load</button>
                    </div>
                </div>
            </div>

        </div>;
    }

    loadStockfishEngine(){

        this.stockfish = new Worker("stockfish/src/stockfish.js");

        this.stockfish.onmessage = (e) => {
            this.updateStockfishOutPut(e.data);
        };

        this.stockfish.postMessage("position startpos");
        this.stockfish.postMessage("isready");
 
    }

    updateStockfishOutPut(msg){

        if(this.stockfish){
            if(msg.startsWith("ready")){
                this.stockfish_out.current.innerHTML = "Stockfish Ready";
            }if(msg.startsWith("best")){
                this.stockfish_out.current.innerHTML += "<br><br>" + msg;
            }else{
                let t = msg.match(/cp .* nodes/);
                if(t){
                    this.stockfish_out.current.innerHTML = Number(t[0].split(' ')[1])/100;
                }
                t = msg.match(/ pv .*/)
                if(t){
                    this.stockfish_out.current.innerHTML += "<br><br>" + msg.substring(t.index+4);
                }
            }
        }

    }

    loadFEN(){

        let input = document.getElementById("FENstring");

        if(input){
            let FENstring = input.value;
            this.board.current.loadFEN(FENstring);
            this.stockfish.postMessage("position fen " + FENstring);
            this.stockfish.postMessage("isready");
        }

    }

}