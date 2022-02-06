import "./styles/Profile.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Signin extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        let user = await axios.get("http://localhost:4000/profile");
        this.setState({
            user: user.data
        });
    }

    signout() {
        localStorage.clear();
        window.location.replace("/");
    }

    render() {
        if (this.state.user == null) {
            return <div className="signin center">
                <p></p>
            </div>;
        } else {
            return <div className="signin center">
                <p>{ this.state.user.email }</p>
                <button className="btn" onClick={this.signout}>Sign out</button>
            </div>;
        }
    }

}
