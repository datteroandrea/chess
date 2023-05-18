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
            <video className="camera" ref={this.camera} muted={this.props.isOwnCamera}></video>
            <span ref={this.microphoneControl} className={(this.state.muted || this.state.adminMute)? "control toggleMicrophone toggle" : "control toggleMicrophone"} onClick={e => this.props.isAdmin ? this.toggleAdminMute(e) : this.toggleMicrophone(e)} />
            <span ref={this.boardControl} className={((this.state.editBoard) ? "control toggleBoard toggle" : "control toggleBoard")} onClick={e => this.toggleBoard(e)}/>
            <span ref={this.cameraControl} className={(this.state.streaming)? "control toggleCamera" : "control toggleCamera toggle"} onClick={e => this.toggleCamera(e)} />
        </div>;
    }

    toggleMicrophone() {
        let mute = !this.state.muted || this.state.adminMute;
        //console.log("New muted state: ", !this.state.muted);
        //console.log("Mute: ", mute);
        this.camera.current.srcObject.getAudioTracks()[0].enabled = !mute;

        if(this.props.onToggleMicrophone && typeof(this.props.onToggleMicrophone) === "function") {
            this.props.onToggleMicrophone();
        }

        this.setState({
            muted: !this.state.muted
        });
    }

    toggleCamera() {
        if(this.props.enable){
            this.camera.current.srcObject.getVideoTracks()[0].enabled = !this.camera.current.srcObject.getVideoTracks()[0].enabled;
            this.setState({
                streaming: this.camera.current.srcObject.getVideoTracks()[0].enabled
            });
        }
    }

    toggleBoard(){
        if(this.props.enable){
            this.state.editBoard = !this.state.editBoard;
            //TODO: call chessboard setEditability(this.state.editBoard);
            this.setState({ });
            if(this.props.onToggleBoard) {
                this.props.onToggleBoard();
            }
        }
    }

    hideToggleBoard(){
        this.boardControl.current.classList.add("noshow");
    }

    toggleAdminMute() {
        let mute = this.state.muted || !this.state.adminMute;
        //console.log("New adminMute state: ", !this.state.adminMute);
        //console.log("Mute: ", this.state.muted);
        this.camera.current.srcObject.getAudioTracks()[0].enabled = !mute;

        if(this.props.onToggleAdminMicrophone && typeof(this.props.onToggleAdminMicrophone) === "function") {
            this.props.onToggleAdminMicrophone();
        }

        this.setState({
            adminMute: !this.state.adminMute
        });
    }

}
