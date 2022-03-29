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
        this.state.streaming = true;
        this.microphoneControl = React.createRef();
        this.cameraControl = React.createRef();
    }

    componentDidMount() {
        this.camera.current.srcObject = this.props.stream;
        this.camera.current.play();
    }

    render() {
        return <div className='cameraAndControlsHolder'>
            <video className="camera" ref={this.camera} muted={this.state.muted && !this.state.adminMute}></video>
            <span ref={this.microphoneControl} className={(this.state.muted && !this.state.adminMute)? "control toggleMicrophone" : "control toggleMicrophone toggle"} onClick={e => this.toggleMicrophone(e)} />
            <span ref={this.cameraControl} className={(this.state.streaming)? "control toggleCamera" : "control toggleCamera toggle"} onClick={e => this.toggleCamera(e)} />
        </div>;
    }

    toggleMicrophone() {
        this.state.muted = !this.state.muted;
        this.setState({ });
    }

    toggleCamera() {
        this.state.streaming = !this.state.streaming;
        this.camera.current.srcObject = this.state.streaming ? this.props.stream : null;
        if (this.camera.current.srcObject) this.camera.current.play();
        this.setState({ });
    }

    toggleAdminMute() {
        this.state.adminMute = !this.state.adminMute;
        this.setState({});
    }

}
