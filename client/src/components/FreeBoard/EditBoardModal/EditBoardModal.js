import "./EditBoardModalStyle.css";
import React from "react";
import ReactDom from "react-dom";
import Chessboard from "../../Chessboard/Chessboard";

const { Component } = React;

const tools = [ {name:"del", ref:React.createRef()},
                {name:"K", ref:React.createRef()},
                {name:"Q", ref:React.createRef()},
                {name:"R", ref:React.createRef()},
                {name:"B", ref:React.createRef()},
                {name:"N", ref:React.createRef()},
                {name:"P", ref:React.createRef()},
                {name:"move", ref:React.createRef()},
                {name:"k", ref:React.createRef()},
                {name:"q", ref:React.createRef()},
                {name:"r", ref:React.createRef()},
                {name:"b", ref:React.createRef()},
                {name:"n", ref:React.createRef()},
                {name:"p", ref:React.createRef()} ];

export default class EditBoardModal extends Component {

    constructor(props){
        super(props);
        this.modal = React.createRef();
        this.editableBoard = React.createRef();
        this.toolSelected = 7;
        this.isMovingPiece = false;
    }

    render() {

        return ReactDom.createPortal(
            <div className="modalBackground" ref={this.modal} disabled>
                    <div className="editBoardModal tool_7">
                        <div className="editBoardTools">
                            <span>
                                <img onClick={() => this.setCursor(0)} ref={tools[0].ref} className="del_tool" alt="Delete"></img>
                                <img onClick={() => this.setCursor(1)} ref={tools[1].ref} className="K_tool" alt="K"></img>
                                <img onClick={() => this.setCursor(2)} ref={tools[2].ref} className="Q_tool" alt="Q"></img>
                                <img onClick={() => this.setCursor(3)} ref={tools[3].ref} className="R_tool" alt="R"></img>
                                <img onClick={() => this.setCursor(4)} ref={tools[4].ref} className="B_tool" alt="B"></img>
                                <img onClick={() => this.setCursor(5)} ref={tools[5].ref} className="N_tool" alt="N"></img>
                                <img onClick={() => this.setCursor(6)} ref={tools[6].ref} className="P_tool" alt="P"></img>
                                <button className="LoadButton" onClick={() => this.extractAndLoadFEN()}>
                                    Load
                                </button>
                            </span>
                            <span>
                                <img onClick={() => this.setCursor(7)} ref={tools[7].ref} className="move_tool selected" alt="Move"></img>
                                <img onClick={() => this.setCursor(8)} ref={tools[8].ref} className="k_tool" alt="k"></img>
                                <img onClick={() => this.setCursor(9)} ref={tools[9].ref} className="q_tool" alt="q"></img>
                                <img onClick={() => this.setCursor(10)} ref={tools[10].ref} className="r_tool" alt="r"></img>
                                <img onClick={() => this.setCursor(11)} ref={tools[11].ref} className="b_tool" alt="b"></img>
                                <img onClick={() => this.setCursor(12)} ref={tools[12].ref} className="n_tool" alt="n"></img>
                                <img onClick={() => this.setCursor(13)} ref={tools[13].ref} className="p_tool" alt="p"></img>
                            </span>
                        </div>
                        <div className="editBoardContainer">
                            <span className="editBoardTitle">EDIT BOARD</span>
                            <div className="closeEditBoard" onClick={() => this.disable()}></div>
                            <Chessboard ref={this.editableBoard} playerColor="none" noGrab={true}
                            onTileClick={e => {
                                if(this.toolSelected === 0){
                                    //handle delete
                                    if(e.target.classList[0] === "Piece"){
                                        e.target.remove();
                                    }
                                }else if(this.toolSelected === 7){
                                    //handle move
                                    if(e.target.classList[0] === "Piece"){
                                        this.isMovingPiece = true;
                                        let pos = tools.map(e => e.name).indexOf(e.target.classList[3]);
                                        this.setCursor(pos);
                                        e.target.remove();
                                    }
                                }else if (this.toolSelected){
                                    //handle place piece
                                    let color = this.toolSelected > 7 ? "black " : "white ";
                                    if(e.target.classList[0] === "Piece"){
                                        e.target.classList.replace(e.target.classList[3], tools[this.toolSelected].name);
                                    }else if(e.target.classList[0] === "Tile"){
                                        let newPiece = document.createElement("div");
                                        newPiece.className = "Piece noGrab " + color + tools[this.toolSelected].name;
                                        e.target.appendChild(newPiece);
                                    }
                                    if(this.isMovingPiece){
                                        this.isMovingPiece = false;
                                        this.setCursor(7);
                                    }
                                }
                            }}/>
                        </div>
                    </div>
            </div>,
            document.getElementById("portal"));

    }

    enable(){
        this.modal.current.removeAttribute("disabled")
    }

    disable(){
        this.modal.current.setAttribute("disabled", true)
    }

    setCursor(t){
        this.modal.current.firstChild.classList.remove(this.modal.current.firstChild.classList[1]);
        this.modal.current.firstChild.classList.add("tool_"+t);
        tools[this.toolSelected].ref.current.classList.remove("selected");
        tools[t].ref.current.classList.add("selected");
        this.toolSelected = t;
    }

    extractAndLoadFEN(){
        let fen = this.editableBoard.current.extractFEN();
        fen +=  " w - - 0 1"
        if(this.props.onFenLoad && typeof(this.props.onFenLoad)==="function")
            this.props.onFenLoad(fen);
        this.disable();
    }

}