import './index.css';
import { Component } from "react";
import { Routes, Route } from 'react-router-dom';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import Home from './components/Home';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Profile from './components/Profile';

// code needs to be here because Home componentDidMount is executed before App componentDidMount (I will find a better way to do this)
// but atm it remains like this.
let token = localStorage.getItem("token");

if (token) {

  if (Date.now() >= jwtDecode(token).exp * 1000) {
    localStorage.removeItem("token");
  } else {
    axios.defaults.headers['Authorization'] = token;
  }
}

export default class App extends Component {

  componentDidMount() {

  }

  render() {
    return (<div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          <Route path="/sign-in" element={<Signin></Signin>}></Route>
          <Route path="/sign-up" element={<Signup></Signup>}></Route>
          <Route path="/forgot-password"></Route>
          <Route path="/profile" element={<Profile></Profile>}></Route>
        </Routes>
      </div>
    </div>);
  }

}
