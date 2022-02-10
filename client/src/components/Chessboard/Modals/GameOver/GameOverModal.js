import React from "react";
import "./GameOverModalStyle.css";

export default function Tile(props) {
  return (
    <div id="gameOverModal">
      <div className="animated-title">
        <div className="text-top">
          <div>
            <span>DRAW</span>
            <span>by 50 move rule</span>
          </div>
        </div>
        <div className="text-bottom">
          <div>nice try</div>
        </div>
      </div>
    </div>
  );
}
