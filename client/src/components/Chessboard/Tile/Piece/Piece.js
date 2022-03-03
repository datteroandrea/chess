import React from 'react';
import "./PieceStyle.css";

const colors = {
    p: "black p",
    n: "black n",
    b: "black b",
    r: "black r",
    q: "black q",
    k: "black k",
    P: "white P",
    N: "white N",
    B: "white B",
    R: "white R",
    Q: "white Q",
    K: "white K"
}

export default function Tile(props) {

    return <div className={'Piece ' + colors[props.pieceName]}></div>;

}
