import './ComputerGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";

export default class ComputerGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {};
    }

    componentDidMount() {
        if (!this.state.playerColor) {
            this.setState({
                playerColor: window.location.pathname.split("/")[3]
            });
        }
    }

    render() {
        return <div className='center'>
            <Chessboard ref={this.board} playerColor={this.state.playerColor} onMove={(move) => {

            }} />
        </div>;
    }

}