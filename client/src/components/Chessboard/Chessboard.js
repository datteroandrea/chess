import React from 'react';
import Tile from './Tile/Tile.js';
import './ChessboardStyle.css';

import * as lib from './chess.js';

const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const COLUMNS = ["a", "b", "c", "d", "e", "f", "g", "h"];

let game;

export default function Chessboard(props) {

    let board = [];
    const fenData = (props.FEN ? props.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    let fen = fenData.split(" ")[0].split('/').join('');
    game = new lib.Chess(fenData);
    console.log(game.ascii());
    let fenPos = 0;
    let skip = 0;

    for (let i = ROWS.length-1; i >= 0; i--){
        for(let j = 0; j < COLUMNS.length; j++){

            let piece;
            if (skip === 0){
                if(fen[fenPos].match(/[pbnrqkPBNRQK]/)){
                    piece = fen[fenPos];
                }else if(fen[fenPos].match(/[1-8]/)){
                    skip = Number.parseInt(fen[fenPos])-1;
                }
                fenPos++
            }else{
                skip--;
            }

            const isDark = ((i+j+2)%2) === 0;
            board.push(<Tile key={COLUMNS[j]+ROWS[i]} isDark={isDark} squareName={COLUMNS[j]+ROWS[i]} pieceName={piece}/>);

        }
    }
  
    return  <div className='Chessboard' 
            onMouseDown={e => mouseDown(e)}
            onMouseMove={e => movePiece(e)}
            onMouseUp={e => mouseUp(e)}
            onContextMenu={e => e.preventDefault()}>
                {board}
                <canvas id="arrowCanvas" width="600px" height="600px"></canvas>
                <div id="promotionModal" disabled>
                    <img onClick={e => promoteTo('q')} src="Assets/Pieces/w_q.svg"></img>
                    <img onClick={e => promoteTo('r')} src="Assets/Pieces/w_r.svg"></img>
                    <img onClick={e => promoteTo('b')} src="Assets/Pieces/w_b.svg"></img>
                    <img onClick={e => promoteTo('n')} src="Assets/Pieces/w_n.svg"></img>
                </div>
            </div>;

}

let pieceGrabbed = null;
let squareSelected = null;
let promotingSquare = null;
let arrowFrom = null;

function mouseDown(e){

    if (e.button === 0){
        if(e.target.classList.contains(game.turn())){
            grabPiece(e);
        }else{
            removeMarks();
        }
    }else if(e.button === 2){
        startArrow(e);
    }

}

function mouseUp(e){

    if (e.button === 0){
        releasePiece(e);
    }else if(e.button === 2){
        finishArrow(e);
    }

}

function grabPiece(e){

    let elem = e.target;

    if(elem.classList.contains("Piece") && !elem.parentNode.classList.contains("Targettable")){

        removeMarks();
        squareSelected = elem.parentNode;
        squareSelected.classList.add("Selected");
        let legalMoves = game.moves({ square : squareSelected.id, verbose: true });
        [...legalMoves].forEach((move) => {
            document.getElementById(move.to).classList.add("Targettable");
        });

        elem.classList.add("Grabbed");

        const x = e.clientX - 37.5;
        const y = e.clientY - 37.5;
        
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;

        pieceGrabbed = elem;

    }

}

function movePiece(e){

    if(pieceGrabbed){

        const x = e.clientX - 37.5;
        const y = e.clientY - 37.5;
        
        pieceGrabbed.style.left = `${x}px`;
        pieceGrabbed.style.top = `${y}px`;

    }

}

function releasePiece(e){

    let targetSquare = e.target;

    let from;
    let to;

    if(pieceGrabbed){

        from = pieceGrabbed.parentNode.id;

        if(targetSquare.classList.contains("Tile")){
            to = targetSquare.id;
        }else if (targetSquare.classList.contains("Piece")){
            to = targetSquare.parentNode.id;
        }

        if(from && to){
            makeMove(from, to);
        }

        pieceGrabbed.classList.remove("Grabbed");
        pieceGrabbed = null;

    }else if (squareSelected){

        from = squareSelected.id;

        if(targetSquare.classList.contains("Tile")){
            to = targetSquare.id;
        }else if (targetSquare.classList.contains("Piece")){
            to = targetSquare.parentNode.id;
        }

        if(from && to){
            makeMove(from, to);
        }

        squareSelected.classList.remove("Selected");
        squareSelected = null;
        
    }

}

function makeMove(from, to){

    let move = game.move({ from: from, to: to , promotion:'q'});

    if(move){

        console.log(move);

        let target = document.getElementById(to);

        if(target.hasChildNodes()){
            target.innerHTML = "";
        }
        if(pieceGrabbed){
            target.append(pieceGrabbed);
        }else{
            target.append(squareSelected.firstChild);
        }

        if(move.flags.includes("e")){
            let square = move.to[0] + move.from[1];
            document.getElementById(square).innerHTML="";
        }

        if(move.flags.includes("k")){
            let fromSquare = "h" + move.from[1];
            let toSquare = "f" + move.from[1];
            document.getElementById(toSquare).append(document.getElementById(fromSquare).firstChild);
        }

        if(move.flags.includes("q")){
            let fromSquare = "a" + move.from[1];
            let toSquare = "d" + move.from[1];
            document.getElementById(toSquare).append(document.getElementById(fromSquare).firstChild);
        }

        if(move.flags.includes("p")){
            promotingSquare = to;
            document.getElementById("promotionModal").removeAttribute("disabled");
        }

        removeMarks();

        console.log(game.ascii());
    }

}

function promoteTo(piece){

    let promotionColor;
    if(game.turn() === 'w'){
        promotionColor = 'b';
    }else{
        promotionColor = 'w';
    }

    if(promotingSquare && game.put({type:piece, color:promotionColor}, promotingSquare)){

        let promotedPiece = document.getElementById(promotingSquare).firstChild;
        let imgString = "url('Assets/Pieces/" + promotionColor + "_" + piece + ".svg')";
        promotedPiece.style.backgroundImage = imgString;
        
    }

    document.getElementById("promotionModal").setAttribute("disabled",true);

}

function startArrow(e){

    let square = e.target;

    if(square.classList.contains("Tile")){
        arrowFrom = square;
    }else if (square.classList.contains("Piece")){
        arrowFrom = square.parentNode;
    }

}

function finishArrow(e){

    if(arrowFrom){

        let square = e.target;
        let arrowTo = null;

        if(square.classList.contains("Tile")){
            arrowTo = square;
        }else if (square.classList.contains("Piece")){
            arrowTo = square.parentNode;
        }

        if(arrowTo){
            if(arrowTo === arrowFrom){
                arrowTo.classList.add("Highlighted")
            }else{
                drawArrow(arrowFrom, arrowTo)
            }
        }

    }

    arrowFrom = null;

}

function drawArrow(from, to){

    //variables to be used when creating the arrow
    let c = document.getElementById("arrowCanvas");
    let fromx = window.scrollX + from.getBoundingClientRect().left - c.getBoundingClientRect().left + 37.5;
    let fromy = window.scrollY + from.getBoundingClientRect().top - c.getBoundingClientRect().top + 37.5;
    let tox = window.scrollX + to.getBoundingClientRect().left - c.getBoundingClientRect().left + 37.5;
    let toy = window.scrollY + to.getBoundingClientRect().top - c.getBoundingClientRect().top + 37.5;
    let ctx = c.getContext("2d");
    let headlen = 7;

    let angle = Math.atan2(toy-fromy,tox-fromx);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = "#c62828";
    ctx.lineWidth = 15;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = "#c62828";
    ctx.lineWidth = 17;
    ctx.stroke();
    ctx.fillStyle = "#c62828";
    ctx.fill();
}

function removeMarks(){

    if(squareSelected) squareSelected.classList.remove("Selected");
    
    [...document.getElementsByClassName("Targettable")].forEach((elem) => {
        elem.classList.remove("Targettable");
    });

    [...document.getElementsByClassName("Highlighted")].forEach((elem) => {
        elem.classList.remove("Highlighted");
    });

    let c = document.getElementById("arrowCanvas");
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    
}
