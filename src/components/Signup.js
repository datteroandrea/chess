import "./styles/Signup.css";
import React from "react";
import { Link } from "react-router-dom";

export default class Signup extends React.Component {

    signup() {
        console.log("Hello!");
    }

    checkPassword() {
        let passwordLabels = document.getElementsByName("passwordCheck");
        let passwordInputs = document.getElementsByName("passwordInput");
        if(passwordInputs[0].value == passwordInputs[1].value && passwordInputs[0].value.length >= 8) {
            passwordLabels.forEach((label)=>{
                label.className = "fa fa-check fa-fw correctPassword";
            });
        } else {
            passwordLabels.forEach((label)=>{
                label.className = "fa fa-times fa-fw wrongPassword";
            });
        }
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

    render() {
        return <div className="signin center">
            <a className="btn btn-lg btn-block btn-outline googlebutton" href="#">
                <img src="https://img.icons8.com/color/16/000000/google-logo.png"/> Signup with Google
            </a>
            <div className="or-container">
                <div className="line-separator"></div>
                <div className="or-label">or</div>
                <div className="line-separator"></div>
            </div>
            <div className="form-group">
                <p className="label">Username</p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-user fa-fw"></i></span>
                    <input name="username" className="form-control" type="text" placeholder="Username"/>
                </div>
            </div>
            <div className="form-group">
                <p className="label">Email Address</p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-envelope fa-fw"></i></span>
                    <input name="email" className="form-control" type="text" placeholder="Email Address"/>
                </div>
            </div>
            <div className="form-group">
                <p name="password" className="label">Password <span><i name="passwordCheck" className="fa fa-times fa-fw wrongPassword"></i></span></p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-lock fa-fw"></i></span>
                    <input name="passwordInput"className="form-control" type="password" placeholder="Password" onInput={this.checkPassword}/>
                        <span className="input-group-text"><i onClick={(e)=>{ this.setPasswordVisibility(e.target.parentElement.parentElement) }}
                            className="fa fa-eye-slash fa-fw"></i></span>
                </div>
            </div>
            <div className="form-group">
                <p className="label">Confirm Password <span><i name="passwordCheck" className="fa fa-times fa-fw wrongPassword"></i></span></p>
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-lock fa-fw"></i></span>
                    <input name="passwordInput" className="form-control" type="password" placeholder="Confirm Password" onInput={this.checkPassword}/>
                        <span className="input-group-text"><i onClick={(e)=>{ this.setPasswordVisibility(e.target.parentElement.parentElement) }}
                            className="fa fa-eye-slash fa-fw"></i></span>
                </div>
            </div>
            <button className="btn btn-outline-success signinbutton" type="submit" form="form1" value="Submit">Signup</button>
            <div>
                <Link to="/sign-in"><a className="signup">Signin</a></Link>
            </div>
        </div>;
    }


}
