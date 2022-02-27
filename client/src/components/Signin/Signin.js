import "./Signin.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
//import jwtDecode from "jwt-decode";

export default class Signin extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    signin() {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let account = { email, password };

        axios.post("/auth/sign-in", account).then((token) => {
            if(!token.data.error) {
                localStorage.setItem("token", token.data);
                window.location.replace("/");
            } else {
                // mostra errore (Wrong email or password)
                console.log("Wrong email or password.");
            }
        });
    }

    setPasswordVisibility(event) {
        let hideShow = event.target;
        let passwordInput = document.getElementById("password");
        if (hideShow.src.includes("eye-solid.svg")) {
            hideShow.src = "./Assets/icons/eye-slash-solid.svg";
            passwordInput.type = "password";
        } else {
            hideShow.src = "./Assets/icons/eye-solid.svg";
            passwordInput.type = "text";
        }
    }

    componentDidMount() {

    }

    render() {
        return <div className="signin center">
            <a className="btn btn-lg btn-block btn-outline googlebutton">
                <img src="./Assets/icons/google-logo.png" /> Signin with Google
            </a>
            <div className="or-container">
                <div className="line-separator"></div>
                <div className="or-label">or</div>
                <div className="line-separator"></div>
            </div>
            <div className="form-group">
                <p className="label">Email Address</p>
                <div className="input-group">
                    <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                        <img src="./Assets/icons/envelope-solid.svg" style={{ width: 16, height: 16 }}></img>
                    </span>
                    <input id="email" name="email" className="form-control" type="text" placeholder="Email Address" />
                </div>
            </div>
            <div className="form-group">
                <p className="label">Password</p>
                <div className="input-group">
                    <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                            <img src="./Assets/icons/lock-solid.svg" style={{ width: 16, height: 16 }}></img>
                        </span>
                    </div>
                    <input id="password" className="form-control" type="password" placeholder="Password" />
                    <div className="input-group-append bg-transparent" onClick={this.setPasswordVisibility}>
                        <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                            <img src="./Assets/icons/eye-slash-solid.svg" style={{ width: 16, height: 16 }}></img>
                        </span>
                    </div>
                </div>
            </div>
            <button style={{marginTop: 20}} className="btn btn-outline-success signinbutton" onClick={this.signin}>Signin</button>
            <div>
                <Link className="signup" to="/sign-up">
                    Signup
                </Link>
                <Link className="forgotpassword" to="/forgot-password">
                    Forgot Password?
                </Link>
            </div>
        </div>;
    }

}
