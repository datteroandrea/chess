import "./CreateTournament.css";
import React from "react";
import { Component } from "react";
import Chessboard from "../Chessboard/Chessboard";
import axios from 'axios';
import MediaQuery from 'react-responsive';


export default class CreateTournament extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }

    render() {
        return <div>
            <div>
                { /** qui mettiamo la scacchiera di gioco */}
            </div>
            <div>
                { /** qui mettiamo il pannello con tutte le impostazioni del torneo ad esempio:
                 * la durata, il tipo di torneo */ }
            </div>
        </div>;
    }

}
