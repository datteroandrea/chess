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
                <h3>STOCKFISH</h3>
            </div>

            <div className="NavigatePositionContainer">
                <h3>NAVIGATE POSITION</h3>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-lock fa-fw"></i></span>
                    <input type="text" className="form-control" placeholder="FEN string..." aria-label="FEN string..." aria-describedby="basic-addon2"></input>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary btn-small" type="button">Load FEN</button>
                    </div>
                </div>
            </div>

        </div>;
    }

}