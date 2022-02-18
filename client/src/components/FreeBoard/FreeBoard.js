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
    }

    render() {

        return <div className="FreeboardContainer">

            <div className="EvaluationBar" ref={this.evalBar} data-eval="0"></div>

            <div className="BoardContainer">
                <Chessboard ref={this.board} onMove={(fen) => {
                    document.getElementById("FENstring").value = fen;
                    this.stockfish.postMessage("stop");
                    this.stockfish.postMessage("position fen " + fen);
                    this.isBlackMove = fen.split(' ')[1] === 'b'
                    this.stockfish.postMessage("go depth 16");
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
                        <button onClick={e => this.loadFEN()} className="btn btn-secondary btn-small" type="button">Load</button>
                    </div>
                </div>
            </div>

        </div>;
    }

    componentDidMount(){
        this.evalBar.current.style.setProperty("--eval", 0);
        this.loadStockfishEngine();
    }

    loadStockfishEngine(){

        this.stockfish = new Worker("stockfish/src/stockfish.js");

        this.stockfish.onmessage = (e) => {
            this.updateStockfishOutPut(e.data);
        };

        this.stockfish.postMessage("setoption name MultiPV value 3")
        this.stockfish.postMessage("position startpos");
        this.stockfish.postMessage("isready");
 
    }

    updateStockfishOutPut(msg){

        console.log(msg);

        if(this.stockfish){
            if(msg.startsWith("ready")){
                //this.stockfish_out.current.innerHTML = "Stockfish Ready";
            }else if(msg.startsWith("best")){
                //this.stockfish_out.current.innerHTML += "<br><br>" + msg;
            }else if(msg.startsWith("info depth")){
                let multipv = msg.match(/multipv .*/)[0].split(' ')[1];
                let cp = msg.match(/cp .* nodes/);
                let evaluation;
                if(cp){
                    evaluation = (this.isBlackMove ? -1 : 1) * Number(cp[0].split(' ')[1]) / 100;
                    if(multipv === "1")this.evalBar.current.style.setProperty("--eval", evaluation);
                    evaluation = evaluation>0 ? "+"+evaluation : String(evaluation);
                    if(multipv === "1")this.evalBar.current.setAttribute("data-eval", evaluation);
                }else{
                    let mate = msg.match(/mate .* nodes/);
                    if(mate){
                        evaluation = Number(mate[0].split(' ')[1]);
                        evaluation = (this.isBlackMove ? -1 : 1)*evaluation
                        if(multipv === "1")this.evalBar.current.style.setProperty("--eval", evaluation*100);
                        evaluation = evaluation>0 ? "M"+evaluation : "-M"+(evaluation*-1);
                        if(multipv === "1")this.evalBar.current.setAttribute("data-eval", evaluation);
                    }
                }
                let pv = msg.match(/ pv .*/);
                if(pv && evaluation){
                    this.evalList.current.editRow(multipv, evaluation, msg.substring(pv.index+4));
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

}