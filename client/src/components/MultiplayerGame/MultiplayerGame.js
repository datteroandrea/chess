import { Component } from "react";
import React from "react";
import Chessboard from "../Chessboard/Chessboard";
import MovesList from '../ComputerGame/MovesList/MovesList';
import "./MultiplayerGame.css";
import axios from 'axios';
import Config from "../../config.json";
import jwtDecode from "jwt-decode";
import Timer from "../Timer/Timer";
import SurrenderModal from "../SurrenderModal/SurrenderModal";
import Toast from "../Toast/Toast";
import io from "socket.io-client";

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
        this.surrenderModal = React.createRef();
        this.drawToast = React.createRef();
        this.state = {
            playerColor: "white"
        };
    }

    async componentDidMount() {

        this.moveList.current.toggle();

        this.socket = io("https://" + Config.address + ":8001", { transports: ['websocket'] });

        this.socket.on('connect', async () => {
            let game = (await axios.post("/games/" + this.gameId + "/play")).data;
            this.socket.emit('join', JSON.stringify({
                token: this.token,
                gameId: this.gameId
            }));

            if (!game.hasEnded) {

                this.setState({
                    game: game,
                    playerColor: this.userId === game.blackPlayerId ? "black" : "white"
                });

                if (this.state.playerColor === "black") {
                    this.board.current.rotateBoardAnimationLess();
                }

                if (this.state.playerColor === this.state.game.turn && this.state.game.isStarted) {
                    this.yourTimer.current.startTimer();
                } else if (this.state.game.isStarted) {
                    this.opponentTimer.current.startTimer();
                }

                game.moves.forEach((move) => {
                    let promotion = move.substring(4, 5);
                    this.board.current.makeMove(move.substring(0, 2), move.substring(2, 4), promotion, false);
                });

            }
        });

        this.socket.on('start', (event) => {
            if (this.state.playerColor === "white") {
                this.yourTimer.current.startTimer();
            } else if (this.state.playerColor === "black") {
                this.opponentTimer.current.startTimer();
            }
        });

        this.socket.on('move', (move) => {
            console.log("Move: " + move);
            let promotion = move.substring(4, 5);
            this.board.current.makeMove(move.substring(0, 2), move.substring(2, 4), promotion, false);
            this.opponentTimer.current.incrementTime(this.state.game.timeIncrement);
            this.opponentTimer.current.stopTimer();
            this.yourTimer.current.startTimer();
        });

        this.socket.on('win', (reason) => {
            this.board.current.endGame(this.state.playerColor.toUpperCase() + " WON", reason);
            this.yourTimer.current.stopTimer();
            this.opponentTimer.current.stopTimer();
        });

        this.socket.on('surrender', (reason) => {
            this.board.current.endGame(this.state.playerColor.toUpperCase() + " WON", reason);
            this.yourTimer.current.stopTimer();
            this.opponentTimer.current.stopTimer();
        });

        this.socket.on('offer-draw', () => {
            console.log("offer-draw");
            this.drawToast.current.open();
        });

        this.socket.on('accepted-draw', (reason) => {
            this.board.current.endGame("DRAW", reason);
            this.yourTimer.current.stopTimer();
            this.opponentTimer.current.stopTimer();
        });

        this.socket.on('lose', (reason) => {
            this.board.current.endGame(this.state.playerColor.toUpperCase() + " LOST", reason);
            this.yourTimer.current.stopTimer();
            this.opponentTimer.current.stopTimer();
        });
    }

    render() {
        this.token = localStorage.getItem("token");
        this.gameId = window.location.pathname.split("/")[2];
        this.userId = jwtDecode(this.token).userId;

        return <div className='multiplayerGameContainer'>

            <Toast ref={this.drawToast} onConfirm={() => {
                this.socket.emit('offer-draw', JSON.stringify({
                    token: this.token,
                    gameId: this.gameId
                }));
                this.board.current.endGame("DRAW", "Agreement");
                this.yourTimer.current.stopTimer();
                this.opponentTimer.current.stopTimer();
            }}></Toast>

            <SurrenderModal ref={this.surrenderModal} onConfirm={() => {
                this.board.current.endGame(this.state.playerColor.toUpperCase() + " LOST", "Surrender");

                this.socket.emit('surrender', JSON.stringify({
                    token: this.token,
                    gameId: this.gameId
                }));

                this.yourTimer.current.stopTimer();
                this.opponentTimer.current.stopTimer();
            }}></SurrenderModal>

            <div className='multiboardContainer'>

                <div className='playerContainer'>
                    <span className="playerTitle">Opponent</span>
                    <span className="piecesCaptured" ref={this.opponentCapturedPieces}><label></label></span>
                    {(this.state.game) ? <Timer ref={this.opponentTimer} playerColor={this.state.playerColor === "white" ? "black" : "white"} time={this.state.playerColor === "white" ? this.state.game.blackPlayerTime : this.state.game.whitePlayerTime} gameId={this.gameId}></Timer> : null}
                </div>

                <Chessboard ref={this.board} playerColor={this.state.playerColor} endGameButtonMessage="ANALYZE"
                    onMove={(move, _, san) => {
                        this.moveList.current.pushMove(move, san);
                        this.socket.emit('move', JSON.stringify({
                            token: this.token,
                            gameId: this.gameId,
                            type: "move",
                            move: move
                        }));
                        this.yourTimer.current.incrementTime(this.state.game.timeIncrement);
                        this.yourTimer.current.stopTimer();
                        this.opponentTimer.current.startTimer();
                    }}
                    onComputerMove={(move, _, san) => {
                        this.moveList.current.pushMove(move, san);
                    }}
                    onGameRestart={() => {
                        window.location.replace("/free-board?moves=" + this.moveList.current.getMoveList());
                    }}
                    onCapture={piece => this.onCaptureHandler(piece)}>
                </Chessboard>

                <div className='playerContainer'>
                    <span className="playerTitle">You</span>
                    <span className="piecesCaptured" ref={this.yourCapturedPieces}><label></label></span>
                    {this.state.game ? <Timer ref={this.yourTimer} playerColor={this.state.playerColor} time={this.state.playerColor === "white" ? this.state.game.whitePlayerTime : this.state.game.blackPlayerTime} gameId={this.gameId}></Timer> : null}
                </div>

            </div>

            <div className='MoveListContainer'>
                <div className="moveListTitle">MOVE LIST</div>
                <MovesList ref={this.moveList}></MovesList>
                <div className="multi-button3">
                    <button className="mbutton3"
                        onClick={() => {
                            this.surrenderModal.current.open();
                        }}>
                        <img src="../../../Assets/icons/surrender.svg" alt="surrender" className="img_icon"></img>
                        Surrender
                    </button>
                    <button className="mbutton3"
                        onClick={() => {
                            this.socket.emit('offer-draw', JSON.stringify({
                                token: this.token,
                                gameId: this.gameId
                            }));
                        }}>
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

    onCaptureHandler(piece) {
        if (piece) {
            let ammount = 0;
            switch (piece) {
                case "p": case "P":
                    ammount = 1;
                    break;
                case "n": case "N": case "b": case "B":
                    ammount = 3;
                    break;
                case "r": case "R":
                    ammount = 4;
                    break;
                case "q": case "Q":
                    ammount = 8;
                    break;
                default:
            }
            let img = document.createElement("img");
            img.classList.add(piece + "_icon");
            let c1 = this.state.playerColor === "black";
            let c2 = piece === piece.toUpperCase();
            img.src = "../Assets/Icons/" + (c2 ? "white" : "black") + "_" + piece + ".svg";
            if (c1 ? c2 : !c2) {
                let similarPiece = this.yourCapturedPieces.current.getElementsByClassName(piece + "_icon")[0];
                if (similarPiece) {
                    similarPiece.parentNode.insertBefore(img, similarPiece);
                } else {
                    this.yourCapturedPieces.current.prepend(img);
                }
                this.yourMaterialCount += ammount;
            } else {
                let similarPiece = this.opponentCapturedPieces.current.getElementsByClassName(piece + "_icon")[0];
                if (similarPiece) {
                    similarPiece.parentNode.insertBefore(img, similarPiece);
                } else {
                    this.opponentCapturedPieces.current.prepend(img);
                }
                this.opponentMaterialCount += ammount;
            }
            if (this.yourMaterialCount > this.opponentMaterialCount) {
                this.yourCapturedPieces.current.lastChild.innerHTML = "+" + (this.yourMaterialCount - this.opponentMaterialCount);
                this.opponentCapturedPieces.current.lastChild.innerHTML = "";
            } else if (this.yourMaterialCount < this.opponentMaterialCount) {
                this.opponentCapturedPieces.current.lastChild.innerHTML = " +" + (this.opponentMaterialCount - this.yourMaterialCount);
                this.yourCapturedPieces.current.lastChild.innerHTML = "";
            } else {
                this.yourCapturedPieces.current.lastChild.innerHTML = "";
                this.opponentCapturedPieces.current.lastChild.innerHTML = "";
            }
        }
    }
}