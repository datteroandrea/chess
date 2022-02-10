import { Component } from "react";

export default class AuthenticationContext extends Component {

    constructor(props) {
        super(props);
    }

    isAuthenticated() {
        return localStorage.getItem("token");
    }

    render() {
        return (
            this.isAuthenticated() ? this.props.authenticated : this.props.nonauthenticated
        );
    }

}