import React from "react";
import "./PromotionModalStyle.css";

export default function Tile(props) {
  return (
    <div id="promotionModal" disabled>
      <img onClick={(e) => props.promoteTo("q")} className="pq" alt="Queen"></img>
      <img onClick={(e) => props.promoteTo("r")} className="pr" alt="Rook"></img>
      <img onClick={(e) => props.promoteTo("b")} className="pb" alt="Bishop"></img>
      <img onClick={(e) => props.promoteTo("n")} className="pn" alt="Knight"></img>
    </div>
  );
}