import "./Home.css";
import { Component } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            games: [],
        };
    }

    async componentDidMount() {
        let games = await this.getGames();
        this.setState({ games: games.data });
    }

    getGames() {
        return axios.get("http://localhost:4000/games");
    }

    render() {
        return <div className="center">
            <Link className="btn btn-lg create-game-btn" to="/games/create"><i className="fa fa-play fa-fw"></i> Create game!</Link>
            <div className="game-list">
                {this.state.games.map((game) => {
                    return <div className="row">
                        <div className="col col-2">Play as { game.blackPlayerId? "white" : "black" }</div>
                        <div className="col col-2">{ game.timeLimit } minutes</div>
                        <div className="col col-2">{ game.isRated ? "Rated" : "Unrated" }</div>
                        <div className="col col-4"><Link className="btn btn-lg play-game-btn" to={ "/games/"+game.gameId }><i className="fa fa-play fa-fw"></i> Play a game!</Link></div>
                    </div>
                })}
            </div>
        </div>;
    }

}
