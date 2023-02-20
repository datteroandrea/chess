import './SurrenderModal.css';
import { Component } from "react";
import React from "react";
import ReactDom from "react-dom";

export default class SurrenderModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.surrenderModal = React.createRef();
    }

    open() {
        this.setState({
            show: true
        })
    }

    render() {
        return ReactDom.createPortal(<div className={this.state.show ? "modal shown" : "modal"}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Surrender?</h5>
                        <img src='../../Assets/icons/xmark-solid.svg' style={{ width: 24, height: 24 }} onClick={() => { this.setState({ show: false }) }}></img>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to surrender?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger btn-outline" onClick={() => { this.props.onConfirm(); this.setState({ show: false }) }}>Surrender</button>
                    </div>
                </div>
            </div>
        </div>, document.getElementById("portal"));
    }

    enable() {
        this.surrenderModal.current.removeAttribute("disabled");
    }

    disable() {
        this.surrenderModal.current.setAttribute("disabled", true);
    }

}