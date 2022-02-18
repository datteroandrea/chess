import "./Signup.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Signup extends Component {

    signup() {
        let username = document.getElementById("username").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirmPassword").value;

        let account = { username, email, password };

        if (password === confirmPassword && password.length >= 8) {
            axios.post("http://localhost:4000/auth/sign-up", account).then((response) => {
                window.location.replace("/sign-in")
            });
        }
    }

    checkPassword() {
        let passwordLabels = document.getElementsByName("passwordCheck");
        let passwordInputs = document.getElementsByName("passwordInput");
        if (passwordInputs[0].value == passwordInputs[1].value && passwordInputs[0].value.length >= 8) {
            passwordLabels.forEach((label) => {
                label.className = "fa fa-check fa-fw correctPassword";
            });
        } else {
            passwordLabels.forEach((label) => {
                label.className = "fa fa-times fa-fw wrongPassword";
            });
        }
    }

    setPasswordVisibility(event) {
        console.log(event.target);
        let hideShow = event.target;
        let passwordInput = event.target.parentElement.parentElement.previousSibling;
        console.log(passwordInput);
        if (hideShow.src.includes("eye-solid.svg")) {
            hideShow.src = "./Assets/icons/eye-slash-solid.svg";
            passwordInput.type = "password";
        } else {
            hideShow.src = "./Assets/icons/eye-solid.svg";
            passwordInput.type = "text";
        }
    }

    render() {
        return <div className="signin center">
            <a className="btn btn-lg btn-block btn-outline googlebutton" href="#">
                <img src="./Assets/icons/google-logo.png" /> Signup with Google
            </a>
            <div className="or-container">
                <div className="line-separator"></div>
                <div className="or-label">or</div>
                <div className="line-separator"></div>
            </div>
            <div className="form-group">
                <p className="label">Username</p>
                <div className="input-group">
                    <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                        <img src="./Assets/icons/user-solid.svg" style={{ width: 16, height: 16 }}></img>
                    </span>
                    <input id="username" name="username" className="form-control" type="text" placeholder="Username" />
                </div>
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
                <p name="password" className="label">Password <span><i name="passwordCheck" className="fa fa-times fa-fw wrongPassword"></i></span></p>
                <div className="input-group">
                    <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                        <img src="./Assets/icons/lock-solid.svg" style={{ width: 16, height: 16 }}></img>
                    </span>
                    <input id="password" name="passwordInput" className="form-control" type="password" placeholder="Password" onInput={this.checkPassword} />
                    <span className="input-group-text"><i onClick={(e) => { this.setPasswordVisibility(e.target.parentElement.parentElement) }}
                        className="fa fa-eye-slash fa-fw"></i></span>
                </div>
            </div>
            <div className="form-group">
                <p className="label">Confirm Password <span><i name="passwordCheck" className="fa fa-times fa-fw wrongPassword"></i></span></p>
                <div className="input-group">
                    <span className="input-group-text bg-transparent  border-0" id="basic-addon1">
                        <img src="./Assets/icons/lock-solid.svg" style={{ width: 16, height: 16 }}></img>
                    </span>
                    <input id="confirmPassword" name="passwordInput" className="form-control" type="password" placeholder="Confirm Password" onInput={this.checkPassword} />
                    <span className="input-group-text bg-transparent  border-0" id="basic-addon1" onClick={this.setPasswordVisibility}>
                        <img src="./Assets/icons/eye-slash-solid.svg" style={{ width: 16, height: 16 }}></img>
                    </span>
                </div>
            </div>
            <button style={{ marginTop: 20 }} className="btn btn-outline-success signinbutton" type="submit" onClick={this.signup}>Signup</button>
            <div>
                <Link className="signup" to="/sign-in">Signin</Link>
            </div>
        </div>;
    }


}
