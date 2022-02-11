import React from "react";
import "./GameOverModalStyle.css";

export default function Tile(props) {
  return (
    <div id="gameOverModal">
      <div className="animated-title">
        <div className="text-top">
          <div>
            <span id="result">DRAW</span>
            <span id="resultDescription">by 50 move rule</span>
          </div>
        </div>
        <div className="text-bottom">
          <button className="bn5" onClick={e => {hideModal(); props.restartGame();}}>PLAY AGAIN</button>
        </div>
      </div>
    </div>
  );
}

function hideModal(){
  document.getElementById("gameOverModal").setAttribute("disabled",true);
}
