import "./styles/Home.css";
import { Component } from "react";
import { Link } from "react-router-dom";
//import axios from 'axios';

// Questa pagina mostra i tornei pubblici a cui ci si può attualmente iscrivere
export default class Tournaments extends Component {

    componentDidMount() {
        
    }

    render() {
        return <div>
            <div>
                { /** qui mettiamo la lista dei tornei */}
            </div>
            <div>
                { /** qui mettiamo il pannello per cercare tornei in base a dei requisiti (filtrare)  */ }
            </div>
        </div>;
    }

}
