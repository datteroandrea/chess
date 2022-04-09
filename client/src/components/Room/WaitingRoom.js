import axios from "axios";
import React from "react";
import { Component } from "react";
import io from "socket.io-client";
import Config from "../../config.json";
import jwtDecode from "jwt-decode";

export default class WaitingRoom extends Component {

    constructor(props) {
        super(props);
        this.state = { };
    }

    async componentDidMount() {

        let response = await axios.get("/rooms/" + this.roomId + "/access/");

        this.setState({ access: response.data.access });

        if(!this.state.access) {
            this.state.socket = io("https://" + Config.address + ":8002", { transports: ['websocket'] });

            this.state.socket.on('admin-approved', (roomId) => {
                window.location.replace("/rooms/" + roomId);
            });

            this.state.socket.on('admin-rejected', () => {
                window.location.replace("/");
            });

            this.state.socket.emit('ask-access', this.roomId, jwtDecode(localStorage.getItem("token")).userId);
        }
    }

    render() {
        this.roomId = window.location.pathname.split("/")[2];
        if (!this.state.access) {
            return <div>
                <h2>Waiting for admin approval!</h2>
            </div>
        } else {
            return this.props.room;
        }
    }

}