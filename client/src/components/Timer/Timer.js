import { Component } from "react";
import React from "react";

export default class Timer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hours: this.props.hours ? this.props.hours : 0,
            minutes: this.props.minutes ? this.props.minutes : 0,
            seconds: this.props.seconds ? this.props.seconds : 0,
            isTicking: false
        }
    }

    componentDidMount() {
        setInterval(() => {
            if(this.state.seconds === 0 && this.state.minutes === 0 && this.state.hours === 0) {
                this.state.isTicking = false;
            }

            if (this.state.isTicking) {
                this.state.seconds--;
                if (this.state.seconds < 0) {
                    this.state.seconds = 59;
                    this.state.minutes--;
                }

                if (this.state.minutes < 0) {
                    this.state.minutes = 59;
                    this.state.hours--;
                }

                
            }
            
            this.setState({});
        }, 1000);
    }

    stopTimer() {
        this.state.isTicking = false;
        this.setState({});
    }

    startTimer() {
        this.state.isTicking = true;
        this.setState({});
    }

    render() {
        return <div>
            <h2>{this.state.hours < 10 ? "0" + this.state.hours : this.state.hours}:{this.state.minutes < 10 ? "0" + this.state.minutes : this.state.minutes}:{this.state.seconds < 10 ? "0" + this.state.seconds : this.state.seconds}</h2>
        </div>
    }

}