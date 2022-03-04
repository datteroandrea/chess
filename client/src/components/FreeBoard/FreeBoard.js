import "./FreeBoard.css";
import Chessboard from "../Chessboard/Chessboard";
import React from "react";
import ToggleSwitch from "./ToggleSwitch/ToggleSwitch"
import EvalList from "./EvalList/EvalList";
import SettingsGear from "./SettingsGear/SettingsGear";

const { Component } = React;

export default class FreeBoard extends Component {

    constructor(props) {
        super(props);
        this.isBlackMove = false;
        this.board = React.createRef();
        this.stockfish_out = React.createRef();
        this.evalBar = React.createRef();
        this.evalList = React.createRef();
        this.stockfishToggleRef = React.createRef();
        this.stockfishON = true;
        this.depthProgess = React.createRef();
        this.depthProgessBar = React.createRef();
        this.depth = "16";
        this.lines = "3";
        this.undoMoveStack = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"];
        this.redoMoveStack = [];
    }

    render() {

        return <div className="FreeboardContainer">

            <div className="EvaluationBar" ref={this.evalBar}>
                <div className="bar">
                    <div className="eval">0</div>
                </div>
            </div>

            <div className="BoardContainer">
                <Chessboard ref={this.board}
                    playerColor="both"
                    onFenUpdate={(fen) => {
                        if(this.stockfishToggleRef.current.state.checked){
                            document.getElementById("FENstring").value = fen;
                            this.stockfish.postMessage("stop");
                            this.stockfish.postMessage("position fen " + fen);
                            this.isBlackMove = fen.split(' ')[1] === 'b'
                            if(this.stockfishON){
                                this.stockfish.postMessage("go depth " + this.depth);
                            }
                            this.undoMoveStack.push(fen);
                        }
                    }}
                    onMove={() => {
                        this.redoMoveStack = [];
                    }}/>
            </div>

            <div className="StockfishContainer">
                <span className="containerTitle">
                    STOCKFISH
                </span>
                <ToggleSwitch ref={this.stockfishToggleRef}
                    onToggle={() => {
                        this.stockfishON = !this.stockfishON;
                        this.evalList.current.toggle();
                        if(this.depthProgessBar.current.hasAttribute("disabled")){
                            this.depthProgessBar.current.removeAttribute("disabled");
                            this.evalBar.current.removeAttribute("disabled");
                            this.stockfish.postMessage("go depth " + this.depth);
                        }else{
                            this.evalBar.current.setAttribute("disabled",true);
                            this.depthProgessBar.current.setAttribute("disabled",true);
                        }
                    }}></ToggleSwitch>
                <SettingsGear depth={this.depth} lines={this.lines}
                    onDepthChange={value => {
                        this.stockfish.postMessage("stop");
                        this.depth = value;
                        if(this.stockfishON){
                            this.stockfish.postMessage("go depth " + this.depth);
                        }
                    }}
                    onLinesChange={value => {
                        this.stockfish.postMessage("stop");
                        this.lines = value;
                        this.evalList.current.onMovesNumberChange(this.lines);
                        this.stockfish.postMessage("setoption name MultiPV value " + this.lines);
                        if(this.stockfishON){
                            this.stockfish.postMessage("go depth " + this.depth);
                        }
                    }}
                />
                <EvalList ref={this.evalList} movesNumber={this.lines}></EvalList>
                <div className="depthProgressContainer" ref={this.depthProgessBar}>
                    <label htmlFor="depthProgress">depth: </label>
                    <span id="depthProgress" ref={this.depthProgess}>0</span>
                </div>
            </div>

            <div className="NavigatePositionContainer">
                <div className="containerTitle">NAVIGATE POSITION</div>
                <div className="input-group bg-light">
                    <div className="input-group-prepend">
                        <p className="pre label">FEN:</p>
                    </div>
                    <input id="FENstring" type="text" className="form-control bg-light" placeholder="FEN string..." defaultValue="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"></input>
                    <div className="input-group-append">
                        <button onClick={e => this.loadFEN()} className="btnIn" type="button">
                        Load  
                        <img src="./Assets/icons/load_right.svg" alt="load" className="img_icon left"></img>
                        <img src="./Assets/icons/board.svg" alt="fen" className="img_icon"></img>
                        </button>
                    </div>
                </div>
                <div className="multi-button">
                    <button onClick={() => this.undoMove()} className="mbutton"><img src="./Assets/icons/prev.svg" alt="prev" className="img_icon"></img>Prev</button>
                    <button onClick={() => this.board.current.restartGame()} className="mbutton"><img src="./Assets/icons/restart.svg" alt="restart" className="img_icon"></img>Restart</button>
                    <button onClick={() => this.rotateBoard()} className="mbutton">Rotate<img src="./Assets/icons/rotate.svg" alt="rotate" className="img_icon"></img></button>
                    <button onClick={() => this.redoMove()} className="mbutton">Next<img src="./Assets/icons/next.svg" alt="next" className="img_icon"></img></button>
                </div>
            </div>

        </div>;
    }

    componentDidMount(){
        this.evalBar.current.style.setProperty("--eval", 50);
        this.loadStockfishEngine();
    }

    loadStockfishEngine(){

        this.stockfish = new Worker("stockfish/src/stockfish.js");

        this.stockfish.onmessage = (e) => {
            this.updateStockfishOutPut(e.data);
        };

        this.stockfish.postMessage("setoption name MultiPV value " + this.lines)
        this.stockfish.postMessage("position startpos");
        this.stockfish.postMessage("go depth " + this.depth);
 
    }

    updateStockfishOutPut(msg){

        if(this.stockfish && this.stockfishON){
            if(msg.startsWith("info depth")){
                let multipv = msg.match(/multipv .*/);
                if(multipv){
                    multipv = multipv[0].split(' ')[1];
                    if(multipv === this.lines){
                        let currentDepth = msg.split(" ")[2];
                        this.depthProgess.current.innerHTML = currentDepth;
                        if(this.depth === currentDepth){
                            this.depthProgessBar.current.classList.add("completed");
                        }else{
                            this.depthProgessBar.current.classList.remove("completed");
                        }
                    }
                    let evaluation;
                    let cp = msg.match(/cp .* nodes/);
                    if(cp){
                        evaluation = (this.isBlackMove ? -1 : 1) * Number(cp[0].split(' ')[1]) / 100;
                        if(multipv === "1"){
                            this.evalBar.current.style.setProperty("--eval", FreeBoard.sigmoidalFunction(evaluation));
                            if (evaluation >= 0 && this.evalBar.current.classList.contains("Negative")){
                                this.evalBar.current.classList.remove("Negative");
                            }else if (evaluation < 0 && !this.evalBar.current.classList.contains("Negative")){
                                this.evalBar.current.classList.add("Negative");
                            }
                            if(this.evalBar.current.classList.contains("Mate")){
                                this.evalBar.current.classList.remove("Mate");
                            }
                        }
                        evaluation = evaluation>0 ? "+"+evaluation : String(evaluation);
                        if(multipv === "1")this.evalBar.current.firstChild.firstChild.innerHTML= evaluation;
                    }else{
                        let mate = msg.match(/mate .* nodes/);
                        if(mate){
                            evaluation = Number(mate[0].split(' ')[1]);
                            evaluation = (this.isBlackMove ? -1 : 1)*evaluation
                            if(multipv === "1"){
                                this.evalBar.current.style.setProperty("--eval", evaluation>0 ? 100 : 0);
                                if (evaluation >= 0 && this.evalBar.current.classList.contains("Negative")){
                                    this.evalBar.current.classList.remove("Negative");
                                }else if (evaluation < 0 && !this.evalBar.current.classList.contains("Negative")){
                                    this.evalBar.current.classList.add("Negative");
                                }
                                if(!this.evalBar.current.classList.contains("Mate")){
                                    this.evalBar.current.classList.add("Mate");
                                }
                            }
                            evaluation = evaluation>0 ? "M"+evaluation : "-M"+(evaluation*-1);
                            if(multipv === "1")this.evalBar.current.firstChild.firstChild.innerHTML= evaluation;
                        }
                    }
                    let pv = msg.match(/ pv .*/);
                    if(pv && evaluation){
                        this.evalList.current.editRow(multipv, evaluation, msg.substring(pv.index+4));
                    }
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
            this.stockfish.postMessage("go depth 16");
        }

    }

    undoMove(){

        if(this.undoMoveStack.length>1){
            let currentFEN = this.undoMoveStack.pop();
            this.redoMoveStack.push(currentFEN);
            let prevFEN = this.undoMoveStack.pop();
            this.board.current.loadFEN(prevFEN);
        }

    }

    redoMove(){

        if(this.redoMoveStack.length>0){
            let nextFEN = this.redoMoveStack.pop();
            this.board.current.loadFEN(nextFEN);
        }
        
    }

    rotateBoard(){
        this.board.current.rotateBoard();
        if(this.evalBar.current.classList.contains("Rotated")){
            this.evalBar.current.classList.remove("Rotated")
        }else{
            this.evalBar.current.classList.add("Rotated")
        }
    }

    static sigmoidalFunction(x) {
        return (90 / (1 + Math.exp(-x/4)))+5;
    }

}