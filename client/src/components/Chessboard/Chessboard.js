import React from 'react';
import { Component } from 'react';
import { renderToString } from 'react-dom/server'
import Tile from './Tile/Tile.js';
import Piece from './Tile/Piece/Piece.js';
import PromotionModal from './Modals/Promotion/PromotionModal.js';
import GameOverModal from './Modals/GameOver/GameOverModal.js';
import './ChessboardStyle.css';
import { Chess } from './chess.js';

const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const COLUMNS = ["a", "b", "c", "d", "e", "f", "g", "h"];
//const blackPieces = [blackPawn, blackKnight, blackBishop, blackRook, blackQueen, blackKing];
//const whitePieces = [whitePawn, whiteKnight, whiteBishop, whiteRook, whiteQueen, whiteKing];

export default class Chessboard extends Component {

    constructor(props) {
        super(props);
        let fen = this.props.FEN ? this.props.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        this.fen = fen.split(" ")[0].split('/').join('');
        this.pieceGrabbed = null;
        this.squareSelected = null;
        this.promotingSquare = null;
        this.arrowFrom = null;
        this.game = new Chess(fen);
    }

    render() {
        let board = [];
        const fenData = (this.props.FEN ? this.props.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        let fen = fenData.split(" ")[0].split('/').join('');
        game = new Chess(fenData);
        console.log(game.ascii());
        let fenPos = 0;
        let skip = 0;
        let canvasSize = vmin(80);
        window.addEventListener("resize", this.resizeCanvas);

        for (let i = ROWS.length - 1; i >= 0; i--) {
            for (let j = 0; j < COLUMNS.length; j++) {

                let piece;
                if (skip === 0) {
                    if (this.fen[fenPos].match(/[pbnrqkPBNRQK]/)) {
                        piece = this.fen[fenPos];
                    } else if (this.fen[fenPos].match(/[1-8]/)) {
                        skip = Number.parseInt(this.fen[fenPos]) - 1;
                    }
                    fenPos++
                } else {
                    skip--;
                }

                const isDark = ((i + j + 2) % 2) === 0;
                board.push(<Tile key={COLUMNS[j] + ROWS[i]} isDark={isDark} squareName={COLUMNS[j] + ROWS[i]} pieceName={piece} />);

            }
        }
    
        return  <div className='Chessboard' 
                onMouseDown={e => this.mouseDown(e)}
                onMouseMove={e => this.movePiece(e)}
                onMouseUp={e => this.mouseUp(e)}
                onContextMenu={e => e.preventDefault()}>
                    {board}
                    <canvas id="arrowCanvas" width={canvasSize} height={canvasSize}></canvas>
                    <div id="modals">
                        <PromotionModal promoteTo={p => this.promoteTo(p)}></PromotionModal>
                        <GameOverModal restartGame={e => this.restartGame()}></GameOverModal>
                    </div>
                </div>;
    }

    mouseDown(e) {
        if (e.button === 0) {
            if (e.target.classList.contains(this.game.turn())) {
                this.grabPiece(e);
            } else {
                this.removeMarks();
            }
        } else if (e.button === 2) {
            this.startArrow(e);
        }
    }

    mouseUp(e) {
        if (e.button === 0) {
            this.releasePiece(e);
        } else if (e.button === 2) {
            this.finishArrow(e);
        }
    }

    grabPiece(e) {
        let elem = e.target;

        if (elem.classList.contains("Piece") && !elem.parentNode.classList.contains("Targettable")) {

            this.removeMarks();
            this.squareSelected = elem.parentNode;
            this.squareSelected.classList.add("Selected");
            let legalMoves = this.game.moves({ square: this.squareSelected.id, verbose: true });
            [...legalMoves].forEach((move) => {
                document.getElementById(move.to).classList.add("Targettable");
            });

            elem.classList.add("Grabbed");

            let offset = vmin(5);

            const x = window.scrollX + e.clientX - offset;
            const y = window.scrollY + e.clientY - offset;

            elem.style.left = `${x}px`;
            elem.style.top = `${y}px`;

            this.pieceGrabbed = elem;

        }
    }

    movePiece(e) {
        if (this.pieceGrabbed) {

            let offset = vmin(5);

            const x = window.scrollX + e.clientX - offset;
            const y = window.scrollY + e.clientY - offset;

            this.pieceGrabbed.style.left = `${x}px`;
            this.pieceGrabbed.style.top = `${y}px`;

        }
    }

    releasePiece(e) {
        let targetSquare = e.target;
        let from;
        let to;

        if (this.pieceGrabbed) {

            from = this.pieceGrabbed.parentNode.id;

            if (targetSquare.classList.contains("Tile")) {
                to = targetSquare.id;
            } else if (targetSquare.classList.contains("Piece")) {
                to = targetSquare.parentNode.id;
            }

            if (from && to) {
                this.makeMove(from, to);
            }

            this.pieceGrabbed.classList.remove("Grabbed");
            this.pieceGrabbed = null;

        } else if (this.squareSelected) {

            from = this.squareSelected.id;

            if (targetSquare.classList.contains("Tile")) {
                to = targetSquare.id;
            } else if (targetSquare.classList.contains("Piece")) {
                to = targetSquare.parentNode.id;
            }

            if (from && to) {
                this.makeMove(from, to);
            }

            this.squareSelected.classList.remove("Selected");
            this.squareSelected = null;
        }
    }

    makeMove(from, to) {
        let move = this.game.move({ from: from, to: to, promotion: 'q' });

        if (move) {

            console.log(move.from + move.to);

            let target = document.getElementById(to);

            let pieceOnTarget = target.childNodes[1];
            if (pieceOnTarget) {
                target.removeChild(pieceOnTarget);
            }
            if (this.pieceGrabbed) {
                target.append(this.pieceGrabbed);
            } else {
                target.append(this.squareSelected.childNodes[1]);
            }

            if (move.flags.includes("e")) {
                let square = move.to[0] + move.from[1];
                document.getElementById(square).innerHTML = "";
            }

            if (move.flags.includes("k")) {
                let fromSquare = "h" + move.from[1];
                let toSquare = "f" + move.from[1];
                document.getElementById(toSquare).append(document.getElementById(fromSquare).firstChild);
            }

            if (move.flags.includes("q")) {
                let fromSquare = "a" + move.from[1];
                let toSquare = "d" + move.from[1];
                document.getElementById(toSquare).append(document.getElementById(fromSquare).firstChild);
            }

            if (move.flags.includes("p")) {
                this.promotingSquare = to;
                document.getElementById("promotionModal").removeAttribute("disabled");
            }else{
                if(this.props.onMove && typeof(this.props.onMove) === "function"){
                    this.props.onMove(game.fen());
                }
            }

            this.removeMarks();

            this.markLastMove(from, to);

            this.isGameOver();

            console.log(game.ascii());
        }

    }

    promoteTo(piece) {
        let promotionColor;

        if (this.game.turn() === 'w') {
            promotionColor = 'b';
        } else {
            promotionColor = 'w';
        }

        if (this.promotingSquare && this.game.put({ type: piece, color: promotionColor }, this.promotingSquare)) {
            let promotedPiece = document.getElementById(this.promotingSquare).firstChild;
            let imgString = "url('../Assets/Pieces/" + promotionColor + "_" + piece + ".svg')";
            promotedPiece.style.backgroundImage = imgString;

            if(this.props.onMove && typeof(this.props.onMove) === "function"){
                this.props.onMove(game.fen());
            }

        }

        document.getElementById("promotionModal").setAttribute("disabled", true);
    }

    startArrow(e) {
        let square = e.target;

        if (square.classList.contains("Tile")) {
            this.arrowFrom = square;
        } else if (square.classList.contains("Piece")) {
            this.arrowFrom = square.parentNode;
        }
    }

    finishArrow(e) {
        if (this.arrowFrom) {
            let square = e.target;
            let arrowTo = null;

            if (square.classList.contains("Tile")) {
                arrowTo = square;
            } else if (square.classList.contains("Piece")) {
                arrowTo = square.parentNode;
            }

            if (arrowTo) {
                if (arrowTo === this.arrowFrom) {
                    arrowTo.classList.add("Highlighted")
                } else {
                    this.drawArrow(this.arrowFrom, arrowTo)
                }
            }
        }

        this.arrowFrom = null;
    }

    drawArrow(from, to) {

        //variables to be used when creating the arrow
        let c = document.getElementById("arrowCanvas");
        let offset = vmin(5);
        let fromx = from.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
        let fromy = from.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
        let tox = to.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
        let toy = to.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
        let ctx = c.getContext("2d");
        let headlen = offset / 4;

        let angle = Math.atan2(toy - fromy, tox - fromx);

        //starting path of the arrow from the start square to the end square and drawing the stroke
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#c62828";
        ctx.lineWidth = offset / 3;
        ctx.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        ctx.strokeStyle = "#c62828";
        ctx.lineWidth = offset / 3;
        ctx.stroke();
        ctx.fillStyle = "#c62828";
        ctx.fill();
    }

    markLastMove(from, to) {

        [...document.getElementsByClassName("LastMoved")].forEach((elem) => {
            elem.classList.remove("LastMoved");
        });

        document.getElementById(from).classList.add("LastMoved");
        document.getElementById(to).classList.add("LastMoved");

    }

    isGameOver() {

        [...document.getElementsByClassName("InCheck")].forEach((elem) => {
            elem.classList.remove("InCheck");
        });

        if (this.game.in_check()) {
            if (this.game.turn() === 'w') {
                document.getElementsByClassName("K")[0].classList.add("InCheck");
            } else {
                document.getElementsByClassName("k")[0].classList.add("InCheck");
            }
        }

        if (this.game.in_checkmate()) {
            if (this.game.turn() === 'w') {
                document.getElementById("result").innerHTML = "BLACK WON";
            } else {
                document.getElementById("result").innerHTML = "WHITE WON";
            }
            document.getElementById("resultDescription").innerHTML = "by checkmate";
            document.getElementById("gameOverModal").removeAttribute("disabled");
        }

        if (this.game.in_draw()) {
            document.getElementById("result").innerHTML = "DRAW";
            if (this.game.insufficient_material()) {
                document.getElementById("resultDescription").innerHTML = "by insufficient material";
            } else if (this.game.in_stalemate()) {
                document.getElementById("resultDescription").innerHTML = "by stalemate";
            } else if (this.game.in_threefold_repetition()) {
                document.getElementById("resultDescription").innerHTML = "by 3 repetitions";
            }
            document.getElementById("gameOverModal").removeAttribute("disabled");
        }

    }

    restartGame() {
        this.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        if(this.props.onMove && typeof(this.props.onMove) === "function"){
            this.props.onMove(game.fen());
        }
    }

    loadFEN(fenData) {

        this.game.load(fenData);

        let skip = 0;
        let fenPos = 0;
        this.fen = fenData.split(" ")[0].split('/').join('');

        for (let i = ROWS.length - 1; i >= 0; i--) {
            for (let j = 0; j < COLUMNS.length; j++) {

                let piece;
                if (skip === 0) {
                    if (this.fen[fenPos].match(/[pbnrqkPBNRQK]/)) {
                        piece = this.fen[fenPos];
                    } else if (this.fen[fenPos].match(/[1-8]/)) {
                        skip = Number.parseInt(this.fen[fenPos]) - 1;
                    }
                    fenPos++
                } else {
                    skip--;
                }

                let square = document.getElementById(COLUMNS[j] + ROWS[i]);
                if (square) {
                    let pieceOnSquare = square.childNodes[1];
                    if(pieceOnSquare){
                        square.removeChild(pieceOnSquare);
                    }
                    if (piece) {
                        square.innerHTML += renderToString(<Piece pieceName={piece}/>);
                    }
                }

            }
        }

        this.removeMarks();
        [...document.getElementsByClassName("LastMoved")].forEach((elem) => {
            elem.classList.remove("LastMoved");
        });
        [...document.getElementsByClassName("InCheck")].forEach((elem) => {
            elem.classList.remove("InCheck");
        });

    }

    removeMarks() {

        if (this.squareSelected) this.squareSelected.classList.remove("Selected");

        [...document.getElementsByClassName("Targettable")].forEach((elem) => {
            elem.classList.remove("Targettable");
        });

        [...document.getElementsByClassName("Highlighted")].forEach((elem) => {
            elem.classList.remove("Highlighted");
        });

        let c = document.getElementById("arrowCanvas");
        c.getContext('2d').clearRect(0, 0, c.width, c.height);

    }

    resizeCanvas() {
        let c = document.getElementById("arrowCanvas");
        let newSize = vmin(80);
        c.width = newSize;
        c.height = newSize;
    }

}

function vh(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (v * h) / 100;
}

function vw(v) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (v * w) / 100;
}

function vmin(v) {
    return Math.min(vh(v), vw(v));
}

function vmax(v) {
    return Math.max(vh(v), vw(v));
}