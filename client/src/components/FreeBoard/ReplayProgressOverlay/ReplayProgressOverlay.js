import "./ReplayProgressOverlayStyle.css";
import React from "react";
import ReactDom from "react-dom";

const { Component } = React;

export default class ReplayProgressOverlay extends Component {

    constructor(props){
        super(props);
        this.modal = React.createRef();
        this.pbar = React.createRef();
    }

    render() {

        return ReactDom.createPortal(
            <div className="replayBackground" ref={this.modal} disabled>
                    <span className="progressTitle">Replaying the game with stockfish...</span>
                    <div className="ReplayProgressBar" ref={this.pbar} percentagelabel="0%"></div>
            </div>,
            document.getElementById("portal"));

    }

    enable(){
        this.modal.current.removeAttribute("disabled")
    }

    disable(){
        this.modal.current.setAttribute("disabled", true)
    }

    setPercentage(percentage){
        this.pbar.current.style.setProperty("--percentage", percentage);
        this.pbar.current.setAttribute("percentagelabel", percentage + "%");
    }

}