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
        this.undoMoveList.push({move:move, eval:null});
    }

    undoMove(){
        this.list.current.removeChild(this.list.current.lastChild);
        this.redoMoveList.push(this.undoMoveList.pop());
    }

    redoMove(){
        this.pushMove(this.redoMoveList.pop().move);
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

    showEvaluation(evaluation, isBlackMove){
        let l = this.undoMoveList.length;
        if(l > 0){
            this.undoMoveList[l-1].eval = evaluation;
            let lastEval = this.undoMoveList[l-2];
            if(lastEval){
                let moveEval = (isBlackMove ? -1 : 1) * (evaluation - lastEval.eval);
                if(moveEval > 0.35){
                    if(moveEval > 1){
                        if(moveEval > 2){
                            if(moveEval > 3){
                                this.setEvaluation(l-2, 5);
                            }else{
                                this.setEvaluation(l-2, 4);
                            }
                        }else{
                            this.setEvaluation(l-2, 3);
                        }
                    }else{
                        this.setEvaluation(l-2, 2);
                    }
                }else{
                    this.setEvaluation(l-2, 1);
                }
            }
        }else{
            this.undoMoveList[0] = {move:"startpos", eval:evaluation};
        }
    }

    setEvaluation(pos, evalString){

        let elem = this.list.current.childNodes[pos];

        if(elem){

            let toRemoveClass = elem.classList[1];
            if(toRemoveClass) elem.classList.remove(toRemoveClass);

            switch(evalString){
                case 1:
                    elem.classList.add("best");
                    break;
                case 2:
                    elem.classList.add("good");
                    break;
                case 3:
                    elem.classList.add("inaccurate");
                    break
                case 4:
                    elem.classList.add("mistake");
                    break
                case 5:
                    elem.classList.add("blunder");
                    break
                default:
                    break;
            }

        }

    }

}