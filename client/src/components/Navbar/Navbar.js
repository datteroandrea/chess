import React from "react";
import { Link } from 'react-router-dom';
import "./Navbar.css";
import jwtDecode from "jwt-decode";

export default class Navbar extends React.Component {

    componentDidMount() {

    }

    render() {
        const token = localStorage.getItem("token");
        return (
            <div className="navbar">
                <div className="pages">
                    <Link to="/" className="btn text-colored">Home</Link>
                </div>
                {token ?
                    <div className="authentication">
                        <Link to="/free-board" className="btn text-colored">Free Board</Link>
                        <Link to="/profile" className="btn text-colored">Profile</Link>
                    </div> : <div className="authentication">
                        <Link to="/free-board" className="btn text-colored">Free Board</Link>
                        <Link to="/sign-in" className="btn text-colored">Signin</Link>
                        <Link to="/sign-up" className="btn text-colored">Signup</Link>
                    </div>}
            </div>);
    }

}
