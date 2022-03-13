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
        return axios.get("/games");
    }

    render() {
        return <div className="center">
            <Link className="btn btn-lg create-game-btn" to="/rooms/create"><i className="fa fa-play fa-fw"></i> Create room!</Link>
            <Link className="btn btn-lg create-game-btn" to="/games/create"><i className="fa fa-play fa-fw"></i> Create game!</Link>
            <Link className="btn btn-lg create-game-btn" to="/tournaments/create"><i className="fa fa-play fa-fw"></i> Create torunament!</Link>
            <div className="game-list">
                {this.state.games.map((game) => {
                    return <div className="row">
                        <div className="col col-2">Play as { game.blackPlayerId? "white" : "black" }</div>
                        <div className="col col-2">{ game.timeLimit } minutes</div>
                        <div className="col col-2">{ game.isRated ? "Rated" : "Unrated" }</div>
                        <div className="col col-4"><Link className="btn btn-lg play-game-btn" to={ "/games/"+game.gameId }><i className="fa fa-play fa-fw"></i> Play game!</Link></div>
                    </div>
                })}
            </div>
        </div>;
    }

}
