import './CreateGame.css';
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';
import MediaQuery from 'react-responsive';

export default class CreateGame extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
        this.state = {
            game: {
                time: 30,
                vs: "Player",
                isRated: true,
                color: "white"
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

    handleColor() {
        this.state.game.color = (this.state.game.color == "white") ? "black" : "white";
        this.setState({});
    }

    handleTime(e) {
        this.state.game.time = e.target.value;
        this.setState({});
    }

    render() {
        return <div className="container">
            <MediaQuery maxWidth={1200} style={{ width: 300 }}>
                <ul class="list-group">
                    <li class="list-group-item" style={{ width: 340 }}>
                        <button className="btn btn-lg time-btn" onClick={this.handleTimeBox}><span><i style={{ height: 20 }} className="fa fas fa-hourglass fa-fw"></i></span> {this.state.game.time} min</button>
                        <div className="time-box hide">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                    <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                </span>
                                <input id="time" name="time" className="form-control" type="number" placeholder="time" min="1" defaultValue={30} onChange={(e) => { this.handleTime(e) }} />
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <button className="btn btn-lg opponent-btn" onClick={() => { this.handlePvP() }}><span><i className="fa fa-user fa-fw"></i></span> {(this.state.game.vs == "Player") ? "Player" : "Computer"}</button>
                    </li>
                    {this.state.game.vs == "Player" ?<li class="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleRated() }}><span><i className="fa fa-trophy fa-fw"></i></span> {(this.state.game.isRated) ? "Rated" : "Unrated"}</button></li> : null}
                    {this.state.game.vs == "Computer" ? <li class="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleColor() }}><span><i className="fa fa-flag fa-fw"></i></span> {(this.state.game.color == "white") ? "White" : "Black"}</button></li> : null}
                    <li class="list-group-item">
                        <button className="btn btn-lg play-btn" onClick={() => { this.createGame() }}>Create Game</button>
                    </li>
                </ul>
            </MediaQuery>
            <MediaQuery minWidth={1201}>
                <div className='row'>
                    <div className="col col-8">
                        <Chessboard ref={this.board} />
                    </div>
                    <div className="col col-4">
                        <ul class="list-group">
                            <li class="list-group-item">
                                <button className="btn btn-lg time-btn" onClick={this.handleTimeBox}><span><i className="fa fas fa-hourglass fa-fw"></i></span> {this.state.game.time} min</button>
                                <div className="time-box hide">
                                    <div className="input-group">
                                        <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                            <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                        </span>
                                        <input id="time" name="time" className="form-control" type="number" placeholder="time" min="1" defaultValue={30} onChange={(e) => { this.handleTime(e) }} />
                                    </div>
                                </div>
                            </li>
                            <li class="list-group-item">
                                <button className="btn btn-lg opponent-btn" onClick={() => { this.handlePvP() }}><span><i className="fa fa-user fa-fw"></i></span> {(this.state.game.vs == "Player") ? "Player" : "Computer"}</button>
                            </li>
                            {this.state.game.vs == "Player" ? <li class="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleRated() }}><span><i className="fa fa-trophy fa-fw"></i></span> {(this.state.game.isRated) ? "Rated" : "Unrated"}</button></li> : null}
                            {this.state.game.vs == "Computer" ? <li class="list-group-item"><button className="btn btn-lg opponent-btn" onClick={() => { this.handleColor() }}><span><i className="fa fa-flag fa-fw"></i></span> {(this.state.game.color == "white") ? "White" : "Black"}</button></li> : null}
                            <li class="list-group-item"><button className="btn btn-lg play-btn" onClick={() => { this.createGame() }}>Create Game</button></li>
                        </ul>
                    </div>
                </div>
            </MediaQuery>

        </div>;
    }

}
