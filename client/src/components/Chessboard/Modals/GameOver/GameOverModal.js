import React from "react";
import { Component } from 'react';
import "./GameOverModalStyle.css";

export default class Tile extends Component {

  constructor(props){
    super(props);
    this.gameOverModal = React.createRef();
    this.result = React.createRef();
    this.reason = React.createRef();
  }

  render(){
    return (<div ref={this.gameOverModal} id="gameOverModal" disabled>
              <div className="animated-title">
                <div className="text-top">
                  <div>
                    <span ref={this.result} id="result">DRAW</span>
                    <span ref={this.reason} id="resultDescription">by 50 move rule</span>
                  </div>
                </div>
                <div className="text-bottom">
                  <button className="bn5" onClick={e => {this.hideModal(); this.props.restartGame();}}>PLAY AGAIN</button>
                </div>
              </div>
            </div>);
  }

  hideModal(){
    this.gameOverModal.current.setAttribute("disabled", true);
  }
  
  showModal(){
    this.gameOverModal.current.removeAttribute("disabled");
  }

  setResult(result){
    this.result.current.innerHTML = result;
  }

  setReason(reason){
    this.reason.current.innerHTML = "by " + reason;
  }

  isNotActive(){
    return this.gameOverModal.current.hasAttribute("disabled");
  }

}