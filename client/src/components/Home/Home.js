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
                    return <div className="gameRow" key={game.gameId}>
                        <div className="gameContent">{ game.timeLimit / 60 } minutes</div>
                        <div className="gameContent">{ game.isRated ? "Rated" : "Unrated" }</div>
                        <div className="gameContent">Play as { game.blackPlayerId? "white" : "black" }</div>
                        <div className="gameJoinButton"><Link to={ "/games/"+game.gameId }> Join Game </Link></div>
                    </div>
                })}
            </div>
        </div>;
    }

}
