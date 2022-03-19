import "./CreateTournament.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";


export default class CreateTournament extends Component {

    constructor(props) {
        super(props);
        this.board = React.createRef();
    }

    render() {
        return <div className="mainContainerCreateTournament">
                    <div className="boardContainerCreateTournament">
                        <Chessboard ref={this.board}/>
                    </div>
                    <div className="optionsContainerCreateTournament">
                        TODO
                    </div>
                </div>;
    }

}
