import "./CreateRoom.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";


export default class CreateRoom extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
    }

    render() {
        return <div className="mainContainerCreateRoom">
                    <div className="boardContainerCreateRoom">
                        <Chessboard ref={this.board}/>
                    </div>
                    <div className="optionsContainerCreateRoom">
                        TODO
                    </div>
                </div>;
    }

}
