import "../../FreeBoard/SettingsGear/SettingsModal/SettingsModalStyle.css";
import React from "react";
import ReactDom from "react-dom";
import SliderSetting from "../../FreeBoard/SettingsGear/SettingsModal/SliderSetting/SliderSetting.js";

const { Component } = React;

export default class SetLevelModal extends Component {

    constructor(props){
        super(props);
        this.modal = React.createRef();
    }

    render() {

        return ReactDom.createPortal(
            <div className="modalBackground" ref={this.modal} disabled>
                    <div className="settingsModal">
                        <span className="settingsTitle">SETTINGS</span>
                        <div className="closeSettings" onClick={() => this.disable()}></div>
                        <SliderSetting title="level" min={1} max={10} step={1} default={this.props.level} onSliderChange={this.props.onLevelChange}/>
                    </div>
            </div>,
            document.getElementById("portal"));

    }

    enable(){
        this.modal.current.removeAttribute("disabled")
    }

    disable(){
        this.modal.current.setAttribute("disabled", true)
    }

}