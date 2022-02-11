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
        return <div className="FreeboardContainer">

            <div className="BoardContainer">
                <Chessboard/>
            </div>

            <div className="StockfishContainer">
                STOCKFISH
            </div>

            <div className="NavigatePositionContainer">
                NAVIGATE POSITION
            </div>

        </div>;
    }

}