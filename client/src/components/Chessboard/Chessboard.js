import React from 'react';
import { Component } from 'react';
import { renderToString } from 'react-dom/server'
import Tile from './Tile/Tile.js';
import Piece from './Tile/Piece/Piece.js';
import PromotionModal from './Modals/Promotion/PromotionModal.js';
import GameOverModal from './Modals/GameOver/GameOverModal.js';
import './ChessboardStyle.css';
import * as Chess from 'chess.js';

const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const COLUMNS = ["a", "b", "c", "d", "e", "f", "g", "h"];

const moveSound = new Audio('Assets/Sounds/move.mp3');
const captureSound = new Audio('Assets/Sounds/capture.mp3');
const castleSound = new Audio('Assets/Sounds/castle.mp3');
const checkSound = new Audio('Assets/Sounds/check.mp3');
const ggSound = new Audio('Assets/Sounds/gg.mp3');

export default class Chessboard extends Component {

    constructor(props) {
        super(props);
        this.fen = (this.props.FEN ? this.props.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        this.boardRef = React.createRef();
        this.game = new Chess(this.fen);
        this.isWhiteOnBottom = true;
        this.pieceGrabbed = null;
        this.squareSelected = null;
        this.promotingMove = null;
        this.arrowFrom = null;
    }

    render() {
        let board = [];
        let fen = this.fen.split(" ")[0].split('/').join('');
        console.log(this.game.ascii());
        let fenPos = 0;
        let skip = 0;
        let canvasSize = vmin(80);
        window.addEventListener("resize", this.resizeCanvas);

        for (let i = ROWS.length - 1; i >= 0; i--) {
            for (let j = 0; j < COLUMNS.length; j++) {

                let piece;
                if (skip === 0) {
                    if (fen[fenPos].match(/[pbnrqkPBNRQK]/)) {
                        piece = fen[fenPos];
                    } else if (fen[fenPos].match(/[1-8]/)) {
                        skip = Number.parseInt(fen[fenPos]) - 1;
                    }
                    fenPos++
                } else {
                    skip--;
                }

                const isDark = ((i + j + 2) % 2) === 0;
                board.push(<Tile key={COLUMNS[j] + ROWS[i]} isDark={isDark} squareName={COLUMNS[j] + ROWS[i]} pieceName={piece} />);

            }
        }
    
        return  <div ref={this.boardRef} className='Chessboard WhiteOnBottom' 
                onMouseDown={e => this.mouseDown(e)}
                onMouseMove={e => this.movePiece(e)}
                onMouseUp={e => this.mouseUp(e)}
                onContextMenu={e => e.preventDefault()}>
                    {board}
                    <canvas id="arrowCanvas" width={canvasSize} height={canvasSize}></canvas>
                    <div id="modals">
                        <PromotionModal promoteTo={p => this.promoteTo(p, true)}></PromotionModal>
                        <GameOverModal restartGame={e => this.restartGame()}></GameOverModal>
                    </div>
                </div>;
    }

    componentDidMount(){
        if(this.props.playerColor === "b"){
            this.rotateBoard();
        }
    }

    mouseDown(e) {
        if (e.button === 0) {
            let playerToMove = this.game.turn();
            if (e.target.classList.contains(playerToMove)) {
                if(this.props.playerColor){
                    if(this.props.playerColor === playerToMove){
                        this.grabPiece(e);
                    }
                }else{
                    this.grabPiece(e);
                }
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

        document.body.style.cursor = "grabbing";

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
            let x;
            let y;

            if(this.isWhiteOnBottom){
                x = window.scrollX + e.clientX - offset;
                y = window.scrollY + e.clientY - offset;
            }else{
                let marginX = this.boardRef.current.getBoundingClientRect().x;
                let xOff = this.squareSelected.id.charCodeAt(0) - 'h'.charCodeAt(0);
                let yOff = Number(this.squareSelected.id[1]);
                x = window.scrollX + e.clientX - marginX - offset + (xOff*vmin(10)) ;
                y = window.scrollY + e.clientY - offset - (yOff*vmin(10));
            }

            elem.style.left = `${x}px`;
            elem.style.top = `${y}px`;

            this.pieceGrabbed = elem;

        }
    }

    movePiece(e) {
        if (this.pieceGrabbed) {

            let offset = vmin(5);
            let x;
            let y;

            if(this.isWhiteOnBottom){
                x = window.scrollX + e.clientX - offset;
                y = window.scrollY + e.clientY - offset;
            }else{
                let marginX = this.boardRef.current.getBoundingClientRect().x;
                let xOff = this.squareSelected.id.charCodeAt(0) - 'h'.charCodeAt(0);
                let yOff = Number(this.squareSelected.id[1]);
                x = window.scrollX + e.clientX - marginX - offset + (xOff*vmin(10)) ;
                y = window.scrollY + e.clientY - offset - (yOff*vmin(10));
            }

            this.pieceGrabbed.style.left = `${x}px`;
            this.pieceGrabbed.style.top = `${y}px`;

        }
    }

    releasePiece(e) {

        let targetSquare = e.target;
        let from;
        let to;
        let isPromotion = false;

        document.body.style.cursor = "default";

        if (this.pieceGrabbed) {

            from = this.pieceGrabbed.parentNode.id;

            if (targetSquare.classList.contains("Tile")) {
                to = targetSquare.id;
            } else if (targetSquare.classList.contains("Piece")) {
                to = targetSquare.parentNode.id;
            }


            if (from && to) {
                if((this.pieceGrabbed.classList.contains("P") && to[1] === '8') || (this.pieceGrabbed.classList.contains("p") && to[1] === '1') ){
                    isPromotion = true;
                }
                this.makeMove(from, to, isPromotion, true);
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
                if((this.squareSelected.childNodes[1].classList.contains("P") && to[1] === '8') || (this.squareSelected.childNodes[1].classList.contains("p") && to[1] === '1') ){
                    isPromotion = true;
                }
                this.makeMove(from, to, isPromotion, true);
            }
        }
    }

    makeMove(from, to, isPromotion, isPlayerMove) {

        if(isPromotion){

            let legalMoves = this.game.moves({ square: from, verbose: true });
            let isLegal = false;

            [...legalMoves].forEach(e => {
                if(e.to === to) isLegal = true;
            });

            if(isLegal){

                let target = document.getElementById(to);

                let pieceOnTarget = target.childNodes[1];
                if (pieceOnTarget) {
                    target.removeChild(pieceOnTarget);
                }
                if (this.pieceGrabbed) {
                    target.append(this.pieceGrabbed);
                } else {
                    if(this.squareSelected){
                        target.append(this.squareSelected.childNodes[1]);
                    }else{
                        target.append(document.getElementById(from).childNodes[1]);
                    }  
                }

                this.promotingMove = {from:from, to:to};

                if(typeof(isPromotion) === "string"){

                    this.promoteTo(isPromotion, isPlayerMove);

                }else{

                    document.getElementById("promotionModal").removeAttribute("disabled");

                }

            }

        }else{

            let move = this.game.move({ from: from, to: to });

            if (move) {

                console.log(move.from + move.to);
                this.playSound(move);

                let target = document.getElementById(to);

                let pieceOnTarget = target.childNodes[1];
                if (pieceOnTarget) {
                    target.removeChild(pieceOnTarget);
                }
                if (this.pieceGrabbed) {
                    target.append(this.pieceGrabbed);
                } else {
                    if(this.squareSelected){
                        target.append(this.squareSelected.childNodes[1]);
                    }else{
                        target.append(document.getElementById(from).childNodes[1]);
                    }  
                }

                if (move.flags.includes("e")) {
                    let square = move.to[0] + move.from[1];
                    let eatedPawn = document.getElementById(square);
                    eatedPawn.removeChild(eatedPawn.childNodes[1]);
                }

                if (move.flags.includes("k")) {
                    let fromSquare = "h" + move.from[1];
                    let toSquare = "f" + move.from[1];
                    document.getElementById(toSquare).append(document.getElementById(fromSquare).childNodes[1]);
                }

                if (move.flags.includes("q")) {
                    let fromSquare = "a" + move.from[1];
                    let toSquare = "d" + move.from[1];
                    document.getElementById(toSquare).append(document.getElementById(fromSquare).childNodes[1]);
                }

                if(this.props.onFenUpdate && typeof(this.props.onFenUpdate) === "function"){
                    this.props.onFenUpdate(this.game.fen());
                }

                if(this.props.onMove && typeof(this.props.onMove) === "function" && isPlayerMove){
                    this.props.onMove(from+to);
                }

                this.removeMarks();

                this.markLastMove(from, to);

                this.isGameOver();

                console.log(this.game.ascii());

                this.squareSelected = null;
            }

        }

    }

    promoteTo(piece, isPlayerMove) {

        console.log(this.promotingMove.from + this.promotingMove.to + piece);

        document.getElementById("promotionModal").setAttribute("disabled", true);

        let promotionColor = this.game.turn();
        
        let move = this.game.move({ from: this.promotingMove.from, to: this.promotingMove.to, promotion: piece });

        if (this.promotingMove && move){

            this.playSound(move);

            let promotedPiece = document.getElementById(this.promotingMove.to).childNodes[1];
            promotedPiece.style.backgroundImage = "url('../Assets/Pieces/" + promotionColor + "_" + piece + ".svg')";
            
            if(promotedPiece.classList.contains("P")){
                promotedPiece.classList.replace("P", piece.toUpperCase());
            }else if(promotedPiece.classList.contains("p")){
                promotedPiece.classList.replace("p", piece);
            }

            if(this.props.onFenUpdate && typeof(this.props.onFenUpdate) === "function"){
                this.props.onFenUpdate(this.game.fen());
            }

            if(this.props.onMove && typeof(this.props.onMove) === "function" && isPlayerMove){
                this.props.onMove(this.promotingMove.from + this.promotingMove.to + piece);
            }

        }

        this.removeMarks();

        this.markLastMove(this.promotingMove.from, this.promotingMove.to);

        this.isGameOver();

        console.log(this.game.ascii());

        this.promotingMove = null;

        this.squareSelected = null;

    }

    playSound(move){
        
        if(this.game.game_over()){
            ggSound.play();
        }else if(this.game.in_check()){
            checkSound.play();
        }else{
            if(move.flags.includes("n") || move.flags.includes("b")) {
                moveSound.play();
            }
    
            if(move.flags.includes("c") || move.flags.includes("e")) {
                captureSound.play();
            }
    
            if(move.flags.includes("k") || move.flags.includes("q")) {
                castleSound.play();
            }
        }
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

        if(this.props.onFenUpdate && typeof(this.props.onFenUpdate) === "function"){
            this.props.onFenUpdate(this.game.fen());
        }

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

    rotateBoard() {
        if(this.boardRef.current.classList.contains("WhiteOnBottom")){
            this.boardRef.current.classList.replace("WhiteOnBottom", "BlackOnBottom");
            this.isWhiteOnBottom = false;
        }else{
            if(this.boardRef.current.classList.contains("BlackOnBottom")){
                this.boardRef.current.classList.replace("BlackOnBottom", "WhiteOnBottom");
                this.isWhiteOnBottom = true;
            }
        }
        let c = document.getElementById("arrowCanvas");
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
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