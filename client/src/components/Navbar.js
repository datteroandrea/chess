import React from "react";
import { Link } from 'react-router-dom';
import jwtDecode from "jwt-decode";

export default class Navbar extends React.Component {

    componentDidMount() {

    }

    render() {
        const token = localStorage.getItem("token");
        return (
            <div className="navbar">
                <div className="pages">
                    <Link to="/" className="btn text-primary">Home</Link>
                </div>
                {token ? <Link to="/profile" className="btn text-primary">Profile</Link> : <div className="authentication">
                    <Link to="/sign-in" className="btn text-primary">Signin</Link>
                    <Link to="/sign-up" className="btn text-primary">Signup</Link>
                </div>}
            </div>);
    }

}
