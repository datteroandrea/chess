import React from "react";
import { Link } from 'react-router-dom';

export default class Navbar extends React.Component {

    componentDidMount() {

    }

    render() {
        return (
            <div className="navbar">
                <div className="pages">
                    <Link to="/"><a className="btn text-primary">Home</a></Link>
                </div>
                <div className="authentication">
                    <Link to="/sign-in"><a className="btn text-primary">Signin</a></Link>
                    <Link to="/sign-up"><a className="btn signup-button text-primary">Signup</a></Link>
                </div>
            </div>);
    }

}
