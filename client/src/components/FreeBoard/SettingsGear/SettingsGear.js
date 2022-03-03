import "./SettingsGearStyle.css";
import React from "react";
import SliderSetting from "./SliderSetting/SliderSetting.js";

const { Component } = React;

export default class SettingsGear extends Component {

    constructor(props){
        super(props);
        this.modal = React.createRef();
    }

    render() {

        return  <span className="settings">
                    <div className="settingsGear" onClick={() => this.modal.current.removeAttribute("disabled")}></div>
                    <div className="modalBackground" ref={this.modal} disabled>
                        <div className="settingsModal">
                            <span className="settingsTitle">SETTINGS</span>
                            <div className="closeSettings" onClick={() => this.modal.current.setAttribute("disabled", true)}></div>
                            <SliderSetting title="depth" min={1} max={50} step={1} default={this.props.depth} onSliderChange={this.props.onDepthChange}/>
                            <SliderSetting title="lines" min={1} max={5} step={1} default={this.props.lines} onSliderChange={this.props.onLinesChange}/>
                        </div>
                    </div>
                </span>

    }

}