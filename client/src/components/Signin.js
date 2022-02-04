import "./styles/Signin.css";
import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Signin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    signin() {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        let account = { email, password };

        
        axios.post("http://localhost:4000/auth/sign-in", account).then((response)=>{
            console.log(response);
        });
    }

    setPasswordVisibility(element) {
        let hideShow = element.children[2].children[0];
        let passwordInput = element.children[1];

        if (hideShow.className == "fa fa-eye fa-fw") {
            hideShow.className = "fa fa-eye-slash fa-fw";
            passwordInput.type = "password";
        } else {
            hideShow.className = "fa fa-eye fa-fw";
            passwordInput.type = "text";
        }
    }

    componentDidMount() {

    }

    render() {
        return <div className="signin center">
            <a className="btn btn-lg btn-block btn-outline googlebutton">
                <img src="https://img.icons8.com/color/16/000000/google-logo.png" /> Signin with Google
            </a>
            <div className="or-container">
                <div className="line-separator"></div>
                <div className="or-label">or</div>
                <div className="line-separator"></div>
            </div>
            <div className="form-group">
                <p className="label">Email Address</p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-envelope fa-fw"></i></span>
                    <input id="email" name="email" className="form-control" type="text" placeholder="Email Address" />
                </div>
            </div>
            <div className="form-group">
                <p className="label">Password</p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-lock fa-fw"></i></span>
                    <input id="password" className="form-control" type="password" placeholder="Password" />
                    <span className="input-group-text"><i id="hideShow" onClick={(e)=>{ this.setPasswordVisibility(e.target.parentElement.parentElement) }}
                        className="fa fa-eye-slash fa-fw"></i></span>
                </div>
            </div>
            <button className="btn btn-outline-success signinbutton" onClick={this.signin}>Signin</button>
            <div>
                <Link to="/sign-up">
                    <a className="signup">Signup</a>
                </Link>
                <Link to="/forgot-password">
                    <a className="forgotpassword" href="forgotpassword.html">Forgot Password?</a>
                </Link>
            </div>
        </div>;
    }

}
