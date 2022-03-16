import './ComputerGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import SetLevelModal from './SetLevelModal/SetLevelModal';
import MovesList from './MovesList/MovesList';

const levels = {
    1: {skill: 0, depth:1},
    2: {skill: 1, depth:2},
    3: {skill: 2, depth:3},
    4: {skill: 3, depth:3},
    5: {skill: 6, depth:5},
    6: {skill: 9, depth:7},
    7: {skill: 10, depth:10},
    8: {skill: 12, depth:12},
    9: {skill: 16, depth:16},
    10: {skill: 20, depth:20}
}

export default class ComputerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.levelModal = React.createRef();
        this.levelLabel = React.createRef();
        this.moveList = React.createRef();
        this.color = window.location.pathname.split("/")[3];
        this.level = window.location.pathname.split("/")[4];
    }

    render() {
        return <div className='computerGameContainer'>
                    <div className='boardContainer'>
                        <Chessboard ref={this.board} playerColor={this.color} 
                        onMove={(move, fen) => {
                            this.triggerStockfish(fen);
                            this.moveList.current.pushMove(move);
                        }}
                        onGameRestart={() => {
                            this.board.current.rotateBoard();
                            this.moveList.current.emptyList();
                            if(this.color === "black"){
                                this.color = "white";
                            }else{
                                this.color = "black";
                                setTimeout(() => {  this.triggerStockfish("startpos"); }, 1000);
                            }
                        }}/>
                    </div>
                    <div className='computerSettingsContainer'>
                        <div className="computerTitle">COMPUTER GAME (level: <label ref={this.levelLabel}>{this.level}</label> )</div>
                        <MovesList ref={this.moveList}></MovesList>
                        <div className="multi-button2">
                            <button onClick={() => this.board.current.endGame((this.color === "white" ? "black" : "white") + " WON", "surrender")} className="mbutton2"><img src="../../../Assets/icons/surrender.svg" alt="surrender" className="img_icon"></img>Surrender</button>
                            <button onClick={() => this.levelModal.current.enable()} className="mbutton2"><img src="../../../Assets/icons/sliders.svg" alt="level" className="img_icon"></img>Level</button>
                            <button onClick={() => this.analyze()} className="mbutton2"><img src="../../../Assets/icons/analyze.svg" alt="analyze" className="img_icon"></img>Analyze</button>
                        </div>
                    </div>
                    <SetLevelModal ref={this.levelModal} level={this.level} onLevelChange={(level) => this.setLevel(level)}></SetLevelModal>
                </div>;
    }

    componentDidMount() {
        this.moveList.current.toggle();
        this.loadStockfishEngine();
    }

    loadStockfishEngine(){
        this.stockfish = new Worker("../../../stockfish/src/stockfish.js");

        this.stockfish.onmessage = (e) => {
            this.playStockfishMove(e.data);
        };

        this.stockfish.postMessage('setoption name Skill Level value ' + levels[this.level].skill);

        if(this.color === "black"){
            this.triggerStockfish("startpos")
        }
    }

    triggerStockfish(fen){
        this.stockfish.postMessage("stop");
        if(fen === "startpos"){
            this.stockfish.postMessage("position startpos");
        }else{
            this.stockfish.postMessage("position fen " + fen);
        }
        this.stockfish.postMessage("go depth " + levels[this.level].depth);
    }

    playStockfishMove(msg){
        if(msg.startsWith("bestmove")){
            let move = msg.split(" ")[1];
            this.board.current.makeMove(move.substring(0,2), move.substring(2,4), move[4]);
            this.moveList.current.pushMove(move);
        }
    }

    setLevel(level){
        this.level = level;
        this.stockfish.postMessage('setoption name Skill Level value ' + levels[this.level].skill);
        this.levelLabel.current.innerHTML = level;
    }

    analyze(){
        window.location.replace("/free-board?moves=" + this.moveList.current.getMoveList());
    }

}