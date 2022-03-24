import React from 'react';
import Piece from './Piece/Piece.js'
import "./TileStyle.css";

export default function Tile(props) {

    let squareColor;
  
    if(props.isDark){
        squareColor = 'Tile Dark'
    }else{
        squareColor = 'Tile Light'
    }

    return <div id ={props.squareName} className={squareColor}
                onClick={e =>{
                    if(props.onTileClick && typeof(props.onTileClick)==="function")
                        props.onTileClick(e);
                }}>
                <p>
                {props.squareName[0] === "a" ? <span className="topLeftsquareName">{props.squareName[1]}</span> : null}
                {props.squareName[1] === "1" ? <span className="bottomRightsquareName">{props.squareName[0]}</span> : null}
                {props.squareName[0] === "h" ? <span className="topLeftsquareName Rotated">{props.squareName[1]}</span> : null}
                {props.squareName[1] === "8" ? <span className="bottomRightsquareName Rotated">{props.squareName[0]}</span> : null}
                </p>
                {props.pieceName ? <Piece pieceName={props.pieceName} noGrab={props.noGrab} /> : null}
            </div>;

}