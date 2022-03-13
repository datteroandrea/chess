import './MovesListStyle.css';
import React from "react";
import { Component } from "react";

const level = {
    1: {name:"best", color: "#4fb4bf", img : new Image()},
    2: {name:"good", color: "#4caf50", img : new Image()},
    3: {name:"inaccurate", color: "#ffeb3b", img : new Image()},
    4: {name:"mistake", color: "#ffa726", img : new Image()},
    5: {name:"blunder", color: "#ff5f52", img : new Image()}
}

export default class MovesList extends Component {

    constructor(props) {
        super(props);
        this.list = React.createRef();
        this.undoMoveList = [];
        this.redoMoveList = [];
        level[1].img.src = "Assets/icons/1_best.svg";
        level[2].img.src = "Assets/icons/2_good.svg";
        level[3].img.src = "Assets/icons/3_inaccurate.svg";
        level[4].img.src = "Assets/icons/4_mistake.svg";
        level[5].img.src = "Assets/icons/5_blunder.svg";
    }

    render() {
            return  <div className='gameMovesContainer enable' ref={this.list}></div>;
    }

    pushMove(move){
        let moveSpan = document.createElement('span');
        let moveNumber = this.undoMoveList.length;
        moveSpan.classList.add("gameMove");
        moveSpan.innerHTML = move;
        moveSpan.addEventListener("mousedown", () => {
            if(this.props.onMoveClick && typeof (this.props.onMoveClick) === "function")
                this.props.onMoveClick(moveNumber);
        });
        moveSpan.addEventListener("mouseenter", () => {
            let move = this.undoMoveList[moveNumber].move;
            let level = this.undoMoveList[moveNumber].moveLevel;
            let alt = this.undoMoveList[moveNumber-1].altMove;
            if(move && alt){
                this.drawArrow(move.substring(0,2), move.substring(2,4), level)
                if(level !== 1)
                    this.drawArrow(alt.substring(0,2), alt.substring(2,4), 1)
            }
        });
        moveSpan.addEventListener("mouseleave", () => {
            let c = document.getElementById("arrowCanvas");
            c.getContext('2d').clearRect(0, 0, c.width, c.height);
        });
        this.list.current.appendChild(moveSpan);
        this.undoMoveList.push({move:move, eval:null, depth:-1, altMove:null});
    }

    undoMove(){
        this.list.current.removeChild(this.list.current.lastChild);
        this.redoMoveList.push(this.undoMoveList.pop());
    }

    redoMove(isBlackMove){
        let moveToRedo = this.redoMoveList.pop();
        this.pushMove(moveToRedo.move);
        this.showEvaluation(moveToRedo.eval, isBlackMove, moveToRedo.depth, moveToRedo.altMove);
    }

    emptyList(){
        this.list.current.innerHTML = "";
        this.undoMoveList = [];
        this.redoMoveList = [];
    }

    getMoveList(){
        let moves = [];
        [...this.undoMoveList].forEach(e => {
            moves.push(e.move)
        });
        return moves.toString();
    }

    showEvaluation(evaluation, isBlackMove, depth, altMove){
        let l = this.undoMoveList.length;
        if(l > 0){
            if(Number(depth) > this.undoMoveList[l-1].depth){
                this.undoMoveList[l-1].eval = evaluation;
                this.undoMoveList[l-1].depth = Number(depth);
                this.undoMoveList[l-1].altMove = altMove;
                let lastEval = this.undoMoveList[l-2];
                if(lastEval){
                    let moveEval = (isBlackMove ? -1 : 1) * (evaluation - lastEval.eval);
                    let moveLevel;
                    if(moveEval > 0.35){
                        if(moveEval > 1){
                            if(moveEval > 2){
                                if(moveEval > 3){
                                    moveLevel = 5;
                                }else{
                                    moveLevel = 4;
                                }
                            }else{
                                moveLevel = 3;
                            }
                        }else{
                            moveLevel = 2;
                        }
                    }else{
                        moveLevel = 1;
                    }
                    this.setEvaluation(l-2, moveLevel);
                    this.undoMoveList[l-1].moveLevel = moveLevel;
                }
            }
        }else{
            this.undoMoveList[0] = {move:"startpos", eval:evaluation, depth:depth, altMove:null};
        }
    }

    setEvaluation(pos, evalLevel){

        let elem = this.list.current.childNodes[pos];

        if(elem){

            let toRemoveClass = elem.classList[1];
            if(toRemoveClass) elem.classList.remove(toRemoveClass);
            elem.classList.add(level[evalLevel].name);

        }

    }

    toggle(){
        if(this.list.current.classList.contains("enable")){
            this.list.current.classList.remove("enable");
        }else{
            this.list.current.classList.add("enable");
        }
    }

    drawArrow(from, to, evalLevel) {

        let c = document.getElementById("arrowCanvas");

        let fromSquare = document.getElementById(from)
        let toSquare = document.getElementById(to);

        if(fromSquare && toSquare){

            let color = level[evalLevel].color;

            //variables to be used when creating the arrow
            let offset = vmin(5);
            let fromx = fromSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let fromy = fromSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let tox = toSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
            let toy = toSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
            let ctx = c.getContext("2d");
            let headlen = offset/3;

            let angle = Math.atan2(toy - fromy, tox - fromx);

            //starting path of the arrow from the start square to the end square and drawing the stroke
            ctx.beginPath();
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            ctx.strokeStyle = color;
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
            ctx.strokeStyle = color;
            ctx.lineWidth = offset / 2;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fill();

            //draw icon img
            let x = tox + ((fromx - tox)/2);
            let y = toy + ((fromy - toy)/2);
            ctx.fillStyle = "#000000";
            let circle = new Path2D();
            circle.arc(x, y, offset/2+vmin(.2), 0, 2 * Math.PI);
            ctx.fill(circle);
            ctx.drawImage(level[evalLevel].img, x - (offset/2), y - (offset/2), offset, offset);

        }
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