import React from 'react';
import "./PieceStyle.css";

const images = {
    p: "Assets/Pieces/b_p.svg",
    n: "Assets/Pieces/b_n.svg",
    b: "Assets/Pieces/b_b.svg",
    r: "Assets/Pieces/b_r.svg",
    q: "Assets/Pieces/b_q.svg",
    k: "Assets/Pieces/b_k.svg",
    P: "Assets/Pieces/w_p.svg",
    N: "Assets/Pieces/w_n.svg",
    B: "Assets/Pieces/w_b.svg",
    R: "Assets/Pieces/w_r.svg",
    Q: "Assets/Pieces/w_q.svg",
    K: "Assets/Pieces/w_k.svg"
}

const colors = {
    p: "b",
    n: "b",
    b: "b",
    r: "b",
    q: "b",
    k: "b",
    P: "w",
    N: "w",
    B: "w",
    R: "w",
    Q: "w",
    K: "w"
}

export default function Tile(props) {

    return <div className={'Piece ' + colors[props.pieceName]} style={{backgroundImage: `url(${images[props.pieceName]})`}}></div>;

}
