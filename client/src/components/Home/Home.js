import "./Home.css";
import { Component } from "react";
import { Link } from "react-router-dom";
//import axios from 'axios';

export default class Home extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }



    render() {
        return <div className="center">
            <button className="btn btn-primary btn-lg btn-block" onClick={() => { window.location.replace("/game/create") }}>Play a game!</button>
        </div>;
    }

}
