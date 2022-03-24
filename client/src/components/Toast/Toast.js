import './Toast.css';
import { Component } from "react";
import React from "react";

export default class Toast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }

    render() {
        return <div className={(this.state.show ? "toast fade show" : "toast fade")} style={{ position: "absolute", top: 0, right: "40%" }}>
            <div className="toast-header">
                <strong className="me-auto">Draw Offer</strong>
                <span className='close-btn' style={{ fontSize: 20 }} onClick={() => { this.setState({ show: false }) }}>×</span>
            </div>
            <div className="toast-body">
                Your opponent has offered you a draw
                <br></br>
                <button className='btn btn-primary' onClick={()=>{ this.props.onConfirm(); this.setState({ show: false }); }}>Accept</button>
            </div>
        </div>;
    }


}