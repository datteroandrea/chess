import React from "react";
import "./PromotionModalStyle.css";

export default function Tile(props) {
  return (
    <div id="promotionModal" disabled>
      <img onClick={(e) => props.promoteTo("q")} src="../Assets/Pieces/w_q.svg" alt="Queen"></img>
      <img onClick={(e) => props.promoteTo("r")} src="../Assets/Pieces/w_r.svg" alt="Rook"></img>
      <img onClick={(e) => props.promoteTo("b")} src="../Assets/Pieces/w_b.svg" alt="Bishop"></img>
      <img onClick={(e) => props.promoteTo("n")} src="../Assets/Pieces/w_n.svg" alt="Knight"></img>
    </div>
  );
}