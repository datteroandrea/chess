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

    return <div id ={props.squareName} className={squareColor}>
                <p>{props.squareName}</p>
                {props.pieceName ? <Piece pieceName={props.pieceName} /> : null}
            </div>;

}