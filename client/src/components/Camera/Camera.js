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
        this.state.editBoard = false;
        this.microphoneControl = React.createRef();
        this.cameraControl = React.createRef();
        this.boardControl = React.createRef();
    }

    componentDidMount() {
        this.camera.current.srcObject = this.props.stream;
        this.camera.current.play();
    }

    render() {
        return <div className={ (this.props.enable) ? 'cameraAndControlsHolder enable' : 'cameraAndControlsHolder'}>
            <video className="camera" ref={this.camera} muted={this.state.muted || this.state.adminMute}></video>
            <span ref={this.microphoneControl} className={(this.state.muted || this.state.adminMute)? "control toggleMicrophone toggle" : "control toggleMicrophone"} onClick={e => this.toggleMicrophone(e)} />
            <span ref={this.boardControl} className={((this.state.editBoard) ? "control toggleBoard toggle" : "control toggleBoard")} onClick={e => this.toggleBoard(e)}/>
            <span ref={this.cameraControl} className={(this.state.streaming)? "control toggleCamera" : "control toggleCamera toggle"} onClick={e => this.toggleCamera(e)} />
        </div>;
    }

    toggleMicrophone() {
        if(this.props.enable){
            this.state.muted = !this.state.muted;
            this.setState({ });
        }
    }

    toggleCamera() {
        if(this.props.enable){
            this.state.streaming = !this.state.streaming;
            this.camera.current.srcObject = this.state.streaming ? this.props.stream : null;
            if (this.camera.current.srcObject) this.camera.current.play();
            this.setState({ });
        }
    }

    toggleBoard(){
        if(this.props.enable){
            this.state.editBoard = !this.state.editBoard;
            //TODO: call chessboard setEditability(this.state.editBoard);
            this.setState({ });
        }
    }

    hideToggleBoard(){
        this.boardControl.current.classList.add("noshow");
    }

    toggleAdminMute() {
        this.state.adminMute = !this.state.adminMute;
        this.setState({ });
    }

}
