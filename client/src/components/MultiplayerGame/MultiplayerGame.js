import { Component } from "react";

export default class MultiplayerGame extends Component {

    componentDidMount() {
        const ws = new WebSocket("ws://locahost:4001");
        ws.onopen = (event) => {
            ws.send("message\n");
        };

        console.log(ws);
    }

    render() {
        return <div></div>;
    }

}