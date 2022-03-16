import { Component } from "react";
import React from "react";
import axios from 'axios';
import "../Timer/Timer.css"

export default class Timer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            gameId: this.props.gameId,
            userId: this.props.userId,
            time: 30 * 60,
            timer: null
        }
    }

    async componentDidMount() {
        let game = (await axios.post("/games/" + this.state.gameId + "/play")).data;
        let playerColor = game.blackPlayerId  === this.state.userId ? "black" : "white";
        this.state.time = (this.state.userId === game.blackPlayerId ? game.blackPlayerTime : game.whitePlayerTime);

        this.setState({});
        if(game.isStarted && game.turn === playerColor) {
            this.startTimer();
        }
    }

    stopTimer() {
        clearInterval(this.state.timer);
        this.state.timer = null;
        this.setState({});
    }

    startTimer() {
        if (this.state.time > 0 && !this.state.timer) {
            this.state.timer = setInterval(() => {
                this.state.time--;
                if(this.state.time <= 0) {
                    this.state.time = 0;
                    clearInterval(this.state.timer);
                }
                this.setState({});
            }, 1000);
        }
    }

    getTime() {
        let minutes = Math.floor(this.state.time / 60);
        let seconds = Math.floor(this.state.time % 60);
        return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }

    render() {
        return <div className="timer">
            <img src="../../../Assets/icons/timew.svg" alt="analyze" className="timer_icon"></img>
            <h2>{this.getTime()}</h2>
        </div>
    }

}