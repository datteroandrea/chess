import './Camera.css';
import React from "react";
import { Component } from "react";

export default class Camera extends Component {

    constructor(props) {
        super(props);
        this.camera = React.createRef();
        this.muted = this.props.muted;
    }

    componentDidMount() {
        this.camera.current.srcObject = this.props.stream;
        this.camera.current.play();
    }

    render() {
        return <video ref={this.camera} className="camera" muted={this.muted}>
            <div className="controls">
                <span className="input-group-text bg-transparent border-0 hidden" id="basic-addon1">
                    <img src="../Assets/icons/microphone-solid.svg" style={{ width: 20, height: 20 }}></img>
                </span>
                <span className="input-group-text bg-transparent border-0 hidden" id="basic-addon1">
                    <img src="../Assets/icons/video-solid.svg" style={{ width: 20, height: 20 }}></img>
                </span>
            </div>
        </video>;
    }

}
