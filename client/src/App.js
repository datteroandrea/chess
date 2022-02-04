import './index.css';
import React from "react";
import { Routes, Route, Link } from 'react-router-dom';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Navbar from './components/Navbar';

export default class App extends React.Component {

  componentDidMount() {

  }

  render() {
    return (<div>
      <Navbar/>
      <div className="content">
        <Routes>
          <Route path="/">
            <Route path="/sign-in" element={<Signin></Signin>}></Route>
            <Route path="/sign-up" element={<Signup></Signup>}></Route>
            <Route path="/forgot-password"></Route>
          </Route>
        </Routes>
      </div>
    </div>);
  }

}
