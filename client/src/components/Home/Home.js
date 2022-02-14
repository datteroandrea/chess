import "./Home.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.games();
    }

    async games() {
        this.setState({ game: await axios.get("http://localhost:4000/games") });
    }

    render() {
        return <div className="center">
            <button className="btn btn-lg game-btn" onClick={() => { window.location.replace("/games/create") }}><i className="fa fa-play fa-fw"></i> Play a game!</button>
        </div>;
    }

}
