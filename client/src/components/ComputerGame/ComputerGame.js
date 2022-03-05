import './ComputerGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";

export default class ComputerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.color = window.location.pathname.split("/")[3];
    }

    render() {
        return <div className='computerGameContainer'>
                    <div className='boardContainer'>
                        <Chessboard ref={this.board} playerColor={this.color} 
                        onMove={(_, fen) => {
                            this.stockfish.postMessage("stop");
                            this.stockfish.postMessage("position fen " + fen);
                            this.stockfish.postMessage("go depth 16");
                        }}
                        onGameRestart={() => {
                            this.board.current.rotateBoard();
                            if(this.color === "black"){
                                this.color = "white";
                            }else{
                                this.color = "black";
                                this.stockfish.postMessage("position startpos");
                                this.stockfish.postMessage("go depth 16");
                            }
                        }}/>
                    </div>
                </div>;
    }

    componentDidMount() {
        this.loadStockfishEngine();
    }

    loadStockfishEngine(){
        this.stockfish = new Worker("../../stockfish/src/stockfish.js");

        this.stockfish.onmessage = (e) => {
            this.playStockfishMove(e.data);
        };

        if(this.color === "black"){
            this.stockfish.postMessage("position startpos");
            this.stockfish.postMessage("go depth 16");
        }
    }

    playStockfishMove(msg){
        if(msg.startsWith("bestmove")){
            let move = msg.split(" ")[1];
            this.board.current.makeMove(move.substring(0,2), move.substring(2,4), move[4]);
        }
    }

}