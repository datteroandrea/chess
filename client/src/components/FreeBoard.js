import "./styles/FreeBoard.css";
import Chessboard from "./Chessboard/Chessboard.js";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class FreeBoard extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }

    render() {
        return <div className="BoardHolder">
            <Chessboard FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"/>
        </div>;
    }

}