import "./Profile.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Signin extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        let user = await axios.get("/profile");
        this.setState({
            user: user.data
        });
        console.log(this.state.user);
    }

    signout() {
        localStorage.clear();
        window.location.replace("/");
    }

    render() {
        if (this.state.user == null) {
            return <div className="center">
                <p></p>
            </div>;
        } else {
            return <div className="center">
                <p>{ this.state.user.email }</p>
                <p>Elo: { this.state.user.elo }</p>
                <button className="btn btn-outline-danger" onClick={this.signout}>Sign out</button>
            </div>;
        }
    }

}
