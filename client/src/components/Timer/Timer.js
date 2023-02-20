import { Component } from "react";
import React from "react";
import "../Timer/Timer.css"

export default class Timer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            time: this.props.time,
            playerColor: this.props.playerColor,
            timer: null
        }
        this.timerIcon = React.createRef();
    }

    async componentDidMount() {
        this.setState({});
    }

    stopTimer() {
        clearInterval(this.state.timer);
        this.state.timer = null;
        this.setState({});
        this.timerIcon.current.classList.remove("active");
    }

    startTimer() {
        this.timerIcon.current.classList.add("active");
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

    incrementTime(increment) {
        this.state.time += increment;
        this.setState({});
    }

    getTime() {
        let minutes = Math.floor(this.state.time / 60);
        let seconds = Math.floor(this.state.time % 60);
        return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }

    render() {
        return <div className="timer">
            <img ref={this.timerIcon} src="../../../Assets/icons/timew.svg" alt="analyze" className="timer_icon"></img>
            <h2>{this.getTime()}</h2>
        </div>
    }

}