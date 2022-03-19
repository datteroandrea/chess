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
import ComputerGame from "./components/ComputerGame/ComputerGame";
import CreateGame from "./components/CreateGame/CreateGame";
import CreateRoom from "./components/CreateRoom/CreateRoom";
import CreateTournament from "./components/CreateTournament/CreateTournament";
import MultiplayerGame from "./components/MultiplayerGame/MultiplayerGame";
import Room from "./components/Room/Room";
import Config from "./config.json";


// code needs to stay here at the moment because Home componentDidMount is executed before App componentDidMount
// (I will find a better way to do this) but atm it stays like this.
let token = localStorage.getItem("token");
axios.defaults.baseURL = "https://" + Config.address + ':8000';

if (token) {
  if (Date.now() >= jwtDecode(token).exp * 1000) {
    localStorage.removeItem("token");
  } else {
    axios.defaults.headers['Authorization'] = token;
  }
}

function PrivateRoute({ children, redirectTo }) {
  let isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
}

function PublicRoute({ children, redirectTo }) {
  let isAuthenticated = localStorage.getItem("token");
  return !isAuthenticated ? children : <Navigate to={redirectTo} />;
}

export default function App() {
  return <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home></Home>}></Route>
      <Route path="/free-board" element={<FreeBoard></FreeBoard>}></Route>
      <Route path="/sign-in" element={<PublicRoute redirectTo="/profile"><Signin></Signin></PublicRoute>}></Route>
      <Route path="/sign-up" element={<PublicRoute redirectTo="/profile"><Signup></Signup></PublicRoute>}></Route>
      <Route path="/forgot-password"></Route>
      <Route path="/profile" element={<PrivateRoute redirectTo="/sign-in"><Profile></Profile></PrivateRoute>}></Route>
      <Route path="/games/create" element={<PrivateRoute><CreateGame></CreateGame></PrivateRoute>}></Route>
      <Route path="/games/:game_id" element={<PrivateRoute><MultiplayerGame></MultiplayerGame></PrivateRoute>}></Route>
      <Route path="/games/computer/:color/:difficulty" element={<ComputerGame></ComputerGame>}></Route>
      <Route path="/rooms/create" element={<PrivateRoute><CreateRoom></CreateRoom></PrivateRoute>}></Route>
      <Route path="/rooms/:room_id" element={<PrivateRoute><Room></Room></PrivateRoute>}></Route>
      <Route path="/tournaments/create" element={<PrivateRoute><CreateTournament></CreateTournament></PrivateRoute>}></Route>
    </Routes>
  </div>
}
