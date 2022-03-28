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
        return  <div className='cameraAndControlsHolder'>
                    <video className="camera" ref={this.camera} muted={this.muted}></video>
                    <span className="control toggleMicrophone" onClick={e => this.toggleControl(e)}/>
                    <span className="control toggleCamera" onClick={e => this.toggleControl(e)}/>
                </div>;
    }

    toggleControl(e){
        e.target.classList.toggle("toggle");
    }

}
