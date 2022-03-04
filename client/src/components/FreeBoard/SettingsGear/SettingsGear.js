import "./SettingsGearStyle.css";
import React from "react";
import SettingsModal from "./SettingsModal/SettingsModal.js";

const { Component } = React;

export default class SettingsGear extends Component {

    constructor(props){
        super(props);
        this.modal = React.createRef();
    }

    render() {

        return  <span className="settings">
                    <div className="settingsGear" onClick={() => this.modal.current.enable()}></div>
                    <SettingsModal {...this.props} ref={this.modal}/>
                </span>

    }

}