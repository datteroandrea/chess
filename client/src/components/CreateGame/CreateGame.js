import './CreateGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';

export default class CreateGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {
            game: {
                time: 30,
                vs: "Player",
                isRated: true,
                color: "white",
                difficulty: 1,
                timeIncrement: 0
            }
        }
    }

    componentDidMount() {

    }

    createGame() {
        if (this.state.game.vs === "Player") {
            axios.post("/games/create", this.state.game).then((game) => {
                window.location.replace("/games/" + game.data.gameId);
            });
        } else {
            window.location.replace("/games/computer/" + this.state.game.color + "/" + this.state.game.difficulty);
        }
    }

    handleTimeBox(e) {
        if (e.target.nextElementSibling.getAttribute("class").includes("show"))
            e.target.nextElementSibling.setAttribute("class", "time-box hide")
        else
            e.target.nextElementSibling.setAttribute("class", "time-box show")
    }

    handlePvP() {
        this.state.game.vs = (this.state.game.vs == "Player") ? "Computer" : "Player";
        this.setState({});
    }

    handleRated() {
        this.state.game.isRated = (this.state.game.isRated) ? false : true;
        this.setState({});
    }

    handleComputerDifficulty() {
        this.state.game.difficulty = (this.state.game.difficulty % 10) + 1;
        this.setState({});
    }

    handleColor() {
        this.state.game.color = (this.state.game.color == "white") ? "black" : "white";
        if (this.board.current != null) {
            this.board.current.rotateBoard();
        }
        this.setState({});
    }

    handleTime(e) {
        let value = e.target.value;
        if(value < 1) value = 1;
        this.state.game.time = value;
        this.setState({});
    }

    handleTimeIncrement(e) {
        let value = e.target.value;
        if(value > 60) value = 60;
        this.state.game.timeIncrement = value;
        this.setState({});
    }

    render() {
        return <div className="mainContainer">
            <div className="boardContainerCreate">
                <Chessboard ref={this.board} />
            </div>
            <div className="buttonsContainerCreate">
                <ul className="list-group">
                    <li className="list-group-item">
                        <button className="btn btn-lg time-btn" onClick={this.handleTimeBox}><span><i className="fa fas fa-hourglass fa-fw"></i></span> {this.state.game.time} min + {this.state.game.timeIncrement} s</button>
                        <div className="time-box hide">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                    <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                </span>
                                <input id="time" name="time" className="timeInput" type="number" placeholder="time" min={1} value={this.state.game.time} defaultValue={this.state.game.time} onChange={(e) => { this.handleTime(e) }} />
                            </div>
                            <div className="input-group" style={{marginTop: 20 }}>
                                <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                    <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                </span>
                                <input id="timeIncrement" name="timeIncrement" className="timeInput" type="number" placeholder="timeIncrement" value={this.state.game.timeIncrement} min={0} max={60} defaultValue={this.state.game.timeIncrement} onChange={(e) => { this.handleTimeIncrement(e) }} />
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <button className="btn btn-lg opponent-btn" onClick={() => { this.handlePvP() }}><span><i className="fa fa-user fa-fw"></i></span> {(this.state.game.vs == "Player") ? "Player" : "Computer"}</button>
                    </li>
                    {this.state.game.vs == "Computer" ? <li className="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleComputerDifficulty() }}><span><i className="fa fa-flag fa-fw"></i></span> Livello {this.state.game.difficulty}</button></li> : null}
                    {this.state.game.vs == "Player" ? <li className="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleRated() }}><span><i className="fa fa-trophy fa-fw"></i></span> {(this.state.game.isRated) ? "Rated" : "Unrated"}</button></li> : null}
                    {this.state.game.vs == "Computer" ? <li className="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleColor() }}><span><i className="fa fa-flag fa-fw"></i></span> {(this.state.game.color == "white") ? "White" : "Black"}</button></li> : null}
                    <li className="list-group-item"><button className="btn btn-lg play-btn" onClick={() => { this.createGame() }}>Create Game</button></li>
                </ul>
            </div>
        </div>;
    }
}
