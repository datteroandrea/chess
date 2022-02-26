import "./FreeBoard.css";
import Chessboard from "../Chessboard/Chessboard";
import React from "react";
import EvalList from "./EvalList/EvalList";

const { Component } = React;

export default class FreeBoard extends Component {

    constructor(props) {
        super(props);
        this.isBlackMove = false;
        this.board = React.createRef();
        this.stockfish_out = React.createRef();
        this.evalBar = React.createRef();
        this.evalList = React.createRef();
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
                    onFenUpdate={(fen) => {
                        document.getElementById("FENstring").value = fen;
                        this.stockfish.postMessage("stop");
                        this.stockfish.postMessage("position fen " + fen);
                        this.isBlackMove = fen.split(' ')[1] === 'b'
                        this.stockfish.postMessage("go depth 16");
                        this.undoMoveStack.push(fen);
                    }}
                    onMove={(move) => {
                        this.redoMoveStack = [];
                    }}/>
            </div>

            <div className="StockfishContainer">
                <div className="divTitle">STOCKFISH</div>
                <EvalList ref={this.evalList} movesNumber={3}></EvalList>
            </div>

            <div className="NavigatePositionContainer">
                <div className="divTitle">NAVIGATE POSITION</div>
                <div className="input-group bg-light">
                    <div className="input-group-prepend">
                        <p className="pre label">FEN:</p>
                    </div>
                    <input id="FENstring" type="text" className="form-control bg-light" placeholder="FEN string..." defaultValue="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"></input>
                    <div className="input-group-append">
                        <button onClick={e => this.loadFEN()} className="btnIn" type="button">
                        Load  
                        <img src="./Assets/icons/load_right.svg" className="img_icon left"></img>
                        <img src="./Assets/icons/board.svg" className="img_icon"></img>
                        </button>
                    </div>
                </div>
                <div className="multi-button">
                    <button onClick={() => this.undoMove()} className="mbutton"><img src="./Assets/icons/prev.svg" className="img_icon"></img>Prev</button>
                    <button onClick={() => this.board.current.restartGame()} className="mbutton"><img src="./Assets/icons/restart.svg" className="img_icon"></img>Restart</button>
                    <button onClick={() => this.rotateBoard()} className="mbutton">Rotate<img src="./Assets/icons/rotate.svg" className="img_icon"></img></button>
                    <button onClick={() => this.redoMove()} className="mbutton">Next<img src="./Assets/icons/next.svg" className="img_icon"></img></button>
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

        this.stockfish.postMessage("setoption name MultiPV value 3")
        this.stockfish.postMessage("position startpos");
        this.stockfish.postMessage("go depth 16");
 
    }

    updateStockfishOutPut(msg){

        if(this.stockfish){
            if(msg.startsWith("info depth")){
                let multipv = msg.match(/multipv .*/);
                if(multipv){
                    multipv = multipv[0].split(' ')[1];
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
                                this.evalBar.current.style.setProperty("--eval", 100);
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
        return 100 / (1 + Math.exp(-x/8));
    }

}