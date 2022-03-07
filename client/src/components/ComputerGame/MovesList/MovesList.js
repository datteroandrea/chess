import './MovesListStyle.css';
import React from "react";
import { Component } from "react";

export default class MovesList extends Component {

    constructor(props) {
        super(props);
        this.list = React.createRef();
        this.undoMoveList = [];
        this.redoMoveList = [];
    }

    render() {
        if(this.props.resize){
            return  <div className='gameMovesContainer resize' ref={this.list}></div>;
        }else{
            return  <div className='gameMovesContainer' ref={this.list}></div>;
        }
    }

    pushMove(move){
        let moveSpan = document.createElement('span');
        moveSpan.classList.add("gameMove");
        moveSpan.innerHTML = move;
        this.list.current.appendChild(moveSpan);
        this.undoMoveList.push(move);
    }

    popMove(){
        this.list.current.removeChild(this.list.current.lastChild);
        this.redoMoveList.push(this.undoMoveList.pop());
    }

    redoMove(){
        this.pushMove(this.redoMoveList.pop());
    }

    emptyList(){
        this.list.current.innerHTML = "";
    }

    getMoveList(){
        return this.undoMoveList.toString();
    }

}