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
                color: "white"
            }
        }
    }

    componentDidMount() {

    }

    createGame() {
        if (this.state.game.vs === "Player") {
            axios.post("http://localhost:4000/games/create", {
                isRated: true,
                timeLimit: 20
            }).then((game) => {
                window.location.replace("/games/" + game.data.gameId);
            });
        }
    }

    handleAccordion(e) {
        if (e.target.nextElementSibling.getAttribute("class").includes("show"))
            e.target.nextElementSibling.setAttribute("class", "accordion-collapse collapse hide")
        else
            e.target.nextElementSibling.setAttribute("class", "accordion-collapse collapse show")
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
            <div className="row">
                <div className="col col-8">
                    <Chessboard ref={this.board} />
                </div>
                <div className="col col-2">
                    <div class="accordion accordion-flush">
                        <div class="accordion-item">
                            <button className="btn btn-lg time-btn" onClick={this.handleAccordion}><span><i className="fa fas fa-hourglass fa-fw"></i></span> {this.state.game.time} min</button>
                            <div className="accordion-collapse collapse hide">
                                <div class="accordion-body" style={{ width: 300 }}>
                                    <div className="input-group">
                                        <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                            <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                        </span>
                                        <input id="time" name="time" className="form-control" type="number" placeholder="time" min="1" defaultValue={30} onChange={(e) => { this.handleTime(e) }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-lg opponent-btn" onClick={() => { this.handlePvP() }}><span><i className="fa fa-user fa-fw"></i></span> { (this.state.game.vs == "Player") ? "Player" : "Computer" }</button>
                    { this.state.game.vs == "Player" ? <button className="btn btn-lg opponent-btn" onClick={() => { this.handleRated() }}><span><i className="fa fa-trophy fa-fw"></i></span> {(this.state.game.isRated) ? "Rated" : "Unrated"}</button> : null }
                    { this.state.game.vs == "Computer" ? <button className="btn btn-lg opponent-btn" onClick={() => { this.handleColor() }}><span><i className="fa fa-flag fa-fw"></i></span> {(this.state.game.color == "white") ? "White" : "Black"}</button> : null }

                    <div class="accordion-item">
                        <button className="btn btn-lg play-btn" onClick={() => { this.createGame() }}>Create Game</button>
                    </div>
                </div>
            </div>
        </div>;
    }

}
