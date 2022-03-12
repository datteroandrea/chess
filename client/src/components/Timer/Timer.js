import { Component } from "react";
import React from "react";
import axios from 'axios';

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
        this.state.time = (this.state.userId === game.blackPlayerId ? game.blackPlayerTime : game.whitePlayerTime);

        // se è il turno del giocatore corrente fa partire il timer
        if((game.turn === "white" && this.state.userId === game.whitePlayerId)
        || (game.turn === "black" && this.state.userId === game.blackPlayerId)) {
            this.startTimer(this.state.time)
        } else {
            this.setState({});
        }
    }

    stopTimer() {
        clearInterval(this.state.timer);
        this.state.timer = null;
        this.setState({});
    }

    startTimer(time) {
        console.log(time);

        this.setState({
            time: time
        });

        if (time > 0) {
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
        return <div>
            <h2>{this.getTime()}</h2>
        </div>
    }

}