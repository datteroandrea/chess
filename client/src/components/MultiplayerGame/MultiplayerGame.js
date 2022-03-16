import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import MovesList from '../ComputerGame/MovesList/MovesList';
import "./MultiplayerGame.css";
import axios from 'axios';
import Config from "../../config.json";
import jwtDecode from "jwt-decode";
import Timer from "../Timer/Timer";
import MediaQuery from 'react-responsive';

export default class MultiplayerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.moveList = React.createRef();
        this.yourCapturedPieces = React.createRef();
        this.opponentCapturedPieces = React.createRef();
        this.yourTimer = React.createRef();
        this.opponentTimer = React.createRef();
        this.yourMaterialCount = 0;
        this.opponentMaterialCount = 0;
        this.state = {
            playerColor: "white"
        };
    }

    async componentDidMount() {
        this.socket = new WebSocket("wss://" + Config.address + ':8001');

        this.socket.onopen = async (event) => {
            let game = (await axios.post("/games/" + this.gameId + "/play")).data;

            if(!game.hasEnded) {
                this.socket.send(JSON.stringify({
                    token: this.token,
                    gameId: this.gameId
                })); 
    
                this.setState({
                    game: game,
                    playerColor: this.userId === game.blackPlayerId ? "black" : "white"
                });
    
                if (this.state.playerColor === "black") {
                    this.board.current.rotateBoard();
                }

                game.moves.forEach((move) => {
                    let promotion = move.substring(4, 5);
                    this.board.current.makeMove(move.substring(0, 2), move.substring(2, 4), promotion, false);
                    this.moveList.current.pushMove(move);
                });
                
            } else {
                
            }
            
        };

        this.socket.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if(message.type === "start") {
                this.yourTimer.current.startTimer();
            } else if (message.type === "move") {
                let promotion = message.move.substring(4, 5);
                this.board.current.makeMove(message.move.substring(0, 2), message.move.substring(2, 4), promotion, false);
                this.moveList.current.pushMove(message.move);
                this.opponentTimer.current.stopTimer();
                this.yourTimer.current.startTimer();
            } else if(message.type === "lose") {
                let promotion = message.move.substring(4, 5);
                this.board.current.makeMove(message.move.substring(0, 2), message.move.substring(2, 4), promotion, false);
                this.moveList.current.pushMove(message.move);
                this.yourTimer.current.stopTimer();
                this.opponentTimer.current.stopTimer();
            } else if (message.type === "win") {
                this.board.current.endGame(this.state.playerColor.toUpperCase() + " WON", message.reason);
                this.yourTimer.current.stopTimer();
                this.opponentTimer.current.stopTimer();
            }
        }
    }

    render() {
        this.token = localStorage.getItem("token");
        this.gameId = window.location.pathname.split("/")[2];
        this.userId = jwtDecode(this.token).user_id;

        return <div className='multiplayerGameContainer'>
                    <div className='multiboardContainer'>
                        <div className='playerContainer'>
                        <span className="playerTitle">Opponent</span>
                        <span className="piecesCaptured" ref={this.opponentCapturedPieces}><label></label></span>
                            <Timer ref={this.opponentTimer} userId={this.userId} gameId={this.gameId}></Timer>
                        </div>
                        <Chessboard ref={this.board} playerColor={this.state.playerColor}
                        onMove={(move) => {
                            this.moveList.current.pushMove(move);
                            this.socket.send(JSON.stringify({
                                token: this.token,
                                gameId: this.gameId, type: "move", move: move
                            }));
                            this.yourTimer.current.stopTimer();
                            this.opponentTimer.current.startTimer();
                        }}
                        onGameRestart={() => {
                            this.moveList.current.emptyList();
                            //TODO: handle after PLAY AGAIN button is pressed
                        }}
                        onCapture={(piece) => {
                            if(piece){
                                let ammount = 0;
                                switch(piece){
                                    case "p":case "P":
                                        ammount = 1;
                                        break;
                                    case "n":case "N":case "b":case "B":
                                        ammount = 3;
                                        break;
                                    case "r":case "R":
                                        ammount = 4;
                                        break;
                                    case "q":case "Q":
                                        ammount = 8;
                                        break;
                                    default:
                                }
                                let img = document.createElement("img");
                                let c1 = this.state.playerColor === "black";
                                let c2 = piece === piece.toUpperCase();
                                img.src = "../Assets/Icons/" + (c2 ? "white" : "black") + "_" + piece+".svg";
                                if (c1 ? c2 : !c2){
                                    this.yourCapturedPieces.current.prepend(img);
                                    this.yourMaterialCount += ammount;
                                }else{
                                    this.opponentCapturedPieces.current.prepend(img);
                                    this.opponentMaterialCount += ammount;
                                }
                                if(this.yourMaterialCount > this.opponentMaterialCount){
                                    this.yourCapturedPieces.current.lastChild.innerHTML = " +" + (this.yourMaterialCount-this.opponentMaterialCount);
                                    this.opponentCapturedPieces.current.lastChild.innerHTML = "";
                                }else if (this.yourMaterialCount < this.opponentMaterialCount){
                                    this.opponentCapturedPieces.current.lastChild.innerHTML = " +" + (this.opponentMaterialCount-this.yourMaterialCount);
                                    this.yourCapturedPieces.current.lastChild.innerHTML = "";
                                }else{
                                    this.yourCapturedPieces.current.lastChild.innerHTML = "";
                                    this.opponentCapturedPieces.current.lastChild.innerHTML = "";
                                }
                            }
                        }}/>
                        <div className='playerContainer'>
                            <span className="playerTitle">You</span>
                            <span className="piecesCaptured" ref={this.yourCapturedPieces}><label></label></span>
                            <Timer ref={this.yourTimer} userId={this.userId} gameId={this.gameId}></Timer>
                        </div>
                    </div>
                    <div className='moveListContainer'>
                        <div className="moveListTitle">MOVE LIST</div>
                        <MovesList ref={this.moveList}></MovesList>
                        <div className="multi-button3">
                            <button className="mbutton3"
                                onClick={() => {/*TODO: surrender*/}}>
                                <img src="../../../Assets/icons/surrender.svg" alt="surrender" className="img_icon"></img>
                                Surrender
                            </button>
                            <button className="mbutton3"
                                onClick={() => {/*TODO: draw*/}}>
                                <img src="../../../Assets/icons/draw.svg" alt="draw" className="img_icon"></img>
                                Draw
                            </button>
                            <button className="mbutton3"
                                onClick={() => window.location.replace("/free-board?moves=" + this.moveList.current.getMoveList())}>
                                <img src="../../../Assets/icons/analyze.svg" alt="analyze" className="img_icon"></img>
                                Analyze
                            </button>
                        </div>
                    </div>
                </div>;
    }
}