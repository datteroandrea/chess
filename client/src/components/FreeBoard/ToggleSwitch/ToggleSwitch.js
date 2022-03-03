import "./ToggleSwitchStyle.css";
import React from "react";

const { Component } = React;

export default class ToggleSwitch extends Component {

    render() {

        return <label className="rocker">
                    <input onChange={() => {this.props.onToggle(); this.toggleState()}} type="checkbox" defaultChecked/>
                    <span className="switch-left">On</span>
                    <span className="switch-right">Off</span>
                </label>;

    }

    componentDidMount(){
        this.setState({checked: true});
    }

    toggleState() {
        if(this.state.checked){
            this.setState({checked: false});
        }else{
            this.setState({checked: true});
        }
    }

}