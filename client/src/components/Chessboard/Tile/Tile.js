import React from 'react';
import Piece from './Piece/Piece.js'
import "./TileStyle.css";

export default function Tile(props) {
  
    if(props.isDark){
        return <div id ={props.squareName} className='Tile Dark'>
            {props.pieceName ? <Piece pieceName={props.pieceName} /> : null}
        </div>;
    }else{
        return <div id ={props.squareName} className='Tile Light'>
            {props.pieceName ? <Piece pieceName={props.pieceName} /> : null}
        </div>;
    }

}