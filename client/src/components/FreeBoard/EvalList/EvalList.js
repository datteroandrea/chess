import "./EvalListStyle.css";
import React from "react";

const { Component } = React;

export default class EvalList extends Component {

    constructor(props){
        super(props);
        this.tableRows = [];
    }

    render() {

        let rows = [];

        for(let i = 1; i <= this.props.movesNumber; i++){
            this.tableRows[i] = React.createRef();
            rows.push(
                <tr key={i} ref={this.tableRows[i]}>
                    <td className="positiveEval">0</td>
                    <td className="moveList">...</td>
                </tr>
            )
        }

        return <table className="content-table">
                    <thead>
                        <tr>
                        <th className="small">Evaluation</th>
                        <th>Line</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
    }

    editRow(row, evaluation, line){

        let cr = this.tableRows[row].current
        cr.childNodes[0].innerHTML = evaluation;
        cr.childNodes[1].innerHTML = "";
        let moveList = line.split(" ");
        for(let i = 0; i < 11 && i < moveList.length; i++){
            let newDiv = document.createElement("div");
            newDiv.className = "move"
            newDiv.innerHTML = moveList[i];
            newDiv.addEventListener("mouseenter", () => this.moveListMouseEnter(moveList[i]));
            newDiv.addEventListener("mouseleave", () => this.moveListMouseLeave());
            cr.childNodes[1].appendChild(newDiv);
        }
        let newDiv = document.createElement("div");
        newDiv.className = "moveDots"
        newDiv.innerHTML = "...";
        cr.childNodes[1].appendChild(newDiv);
        if(evaluation.charAt(0) === '-'){
            if(cr.childNodes[0].classList.contains("positiveEval"))
                cr.childNodes[0].classList.replace("positiveEval", "negativeEval")
        }else{
            if(cr.childNodes[0].classList.contains("negativeEval"))
                cr.childNodes[0].classList.replace("negativeEval", "positiveEval")
        }

    }

    moveListMouseEnter(move){
        
        let c = document.getElementById("arrowCanvas");
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
        if(move){
            this.drawArrow(move.substring(0,2),move.substring(2,4),c);
        }

    }

    moveListMouseLeave(){

        let c = document.getElementById("arrowCanvas");
        c.getContext('2d').clearRect(0, 0, c.width, c.height);

    }

    drawArrow(from, to, c) {

        let fromSquare = document.getElementById(from)
        let toSquare = document.getElementById(to);

        if(fromSquare && toSquare){

        let color = "#4fb3bf"

        //variables to be used when creating the arrow
        let offset = vmin(5);
        let fromx = fromSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
        let fromy = fromSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
        let tox = toSquare.getBoundingClientRect().left - c.getBoundingClientRect().left + offset;
        let toy = toSquare.getBoundingClientRect().top - c.getBoundingClientRect().top + offset;
        let ctx = c.getContext("2d");
        let headlen = offset / 4;

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
        ctx.lineWidth = offset / 3;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();

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