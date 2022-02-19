import { Component } from "react";

export default class MultiplayerGame extends Component {

    componentDidMount() {
        const ws = new WebSocket("ws://127.0.0.1:4001");
        ws.onopen = (event) => {
            ws.send("message");
        };

        console.log(ws);
    }

    render() {
        return <div></div>;
    }

}