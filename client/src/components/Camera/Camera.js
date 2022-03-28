import './Camera.css';
import React from "react";
import { Component } from "react";

export default class Camera extends Component {

    constructor(props) {
        super(props);
        this.camera = React.createRef();
        this.state = {};
        this.state.muted = this.props.muted;
        this.state.adminMute = false;
    }

    componentDidMount() {
        this.camera.current.srcObject = this.props.stream;
        this.camera.current.play();
    }

    render() {
        return <div className='cameraAndControlsHolder'>
            <video className="camera" ref={this.camera} muted={this.state.muted && !this.state.adminMute}></video>
            <span className="control toggleMicrophone" onClick={e => this.toggleMicrophone(e)} />
            <span className="control toggleCamera" onClick={e => this.toggleCamera(e)} />
        </div>;
    }

    toggleMicrophone(e) {
        e.target.classList.toggle("toggle");
        this.state.muted = (e.target.classList).contains("toggle");
        this.setState({});
    }

    toggleCamera(e) {
        e.target.classList.toggle("toggle");
        this.camera.current.srcObject = !(e.target.classList).contains("toggle") ? this.props.stream : null;
        if (this.camera.current.srcObject) this.camera.current.play();
    }

    toggleAdminMute() {
        this.state.adminMute = !this.state.adminMute;
        this.setState({});
    }

}
