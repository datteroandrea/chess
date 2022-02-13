
// La implementiamo nella seguente maniera
// Facciamo normalmente la pagina dove il giocatore può giocare con bianchi e neri
// Inoltre aggiungiamo la possibilità sul div a destra di importare un gioco ed analizzarlo
export default class Analysis extends Component {

    constructor() {

    }

    componentDidMount() {
        
    }

    render() {
        return <div>
            <div>
                { /** qui mettiamo la scacchiera di gioco */}
            </div>
            <div>
                { /** qui mettiamo il pannello con tutte le impostazioni dell'analisi ad esempio:
                 * importa gioco, i risultati delle mosse secondo il computer ecc. */ }
            </div>
        </div>;
    }

}