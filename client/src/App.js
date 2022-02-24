import { Component } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Signin from './components/Signin/Signin';
import Signup from './components/Signup/Signup';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import FreeBoard from './components/FreeBoard/FreeBoard';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Profile from './components/Profile/Profile';
import CreateGame from "./components/CreateGame/CreateGame";
import MultiplayerGame from "./components/MultiplayerGame/MultiplayerGame";

// code needs to stay here at the moment because Home componentDidMount is executed before App componentDidMount
// (I will find a better way to do this) but atm it stays like this.
let token = localStorage.getItem("token");
axios.defaults.baseURL = 'http://localhost:8000';

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

  isAuthenticated() {
    return localStorage.getItem("token");
  }

  render() {
    return (<div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          <Route path="/free-board" element={<FreeBoard></FreeBoard>}></Route>
          <Route path="/sign-in" element={!this.isAuthenticated() ? <Signin></Signin> : <Navigate to="/"></Navigate>}></Route>
          <Route path="/sign-up" element={!this.isAuthenticated() ? <Signup></Signup> : <Navigate to="/"></Navigate>}></Route>
          <Route path="/forgot-password"></Route>
          <Route path="/profile" element={this.isAuthenticated() ? <Profile></Profile> : <Navigate to="/sign-in"></Navigate>}></Route>
          <Route path="/games/create" element={<CreateGame></CreateGame>}></Route>
          <Route path="/games/:game_id" element={<MultiplayerGame></MultiplayerGame>}></Route>
        </Routes>
      </div>
    </div>);
  }

}
