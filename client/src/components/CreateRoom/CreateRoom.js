import "./CreateRoom.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';
import MediaQuery from 'react-responsive';


export default class CreateRoom extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return <div className="container">
            <div className='row'>
                <div className="col col-8">
                    <Chessboard ref={this.board} />
                </div>
                <div className="col col-4">
                    <ul className="list-group">
                        <li className="list-group-item">
                            <div className="time-box hide">
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent border-0" id="basic-addon1">
                                        <img src="../Assets/icons/time.svg" style={{ width: 16, height: 16 }}></img>
                                    </span>
                                    <input id="time" name="time" className="form-control" type="number" placeholder="time" min="1" defaultValue={30} onChange={(e) => { this.handleTime(e) }} />
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item"><button className="btn btn-lg play-btn" onClick={() => { this.createGame() }}>Create Game</button></li>
                    </ul>
                </div>
            </div>
        </div>;
    }

}
