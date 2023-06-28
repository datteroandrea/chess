import './RequestAccessModal.css';
import { Component } from "react";
import React from "react";
import ReactDom from "react-dom";

export default class RequestAccessModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            requests: {}
        }
        this.accessModal = React.createRef();
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
                        <h5 className="modal-title">Requests</h5>
                        <img src='../../Assets/icons/xmark-solid.svg' style={{ width: 24, height: 24 }} onClick={() => { this.setState({ show: false }) }}></img>
                    </div>
                    <div className="modal-body">
                        { Object.entries(this.state.requests).map((user) => {
                            let [userAccessId, value] = user;
                            return <div className='row'>
                                <p className="col">{value.username}</p>
                                <p className="col">{value.email}</p>
                                <button className="col btn btn-outline-success" onClick={() => {
                                    this.props.onConfirm(userAccessId);
                                    this.removeRequest(userAccessId);
                                }}>Allow</button>
                                <button className="col btn btn-outline-danger ms-2" onClick={() => {
                                    this.props.onReject(userAccessId);
                                    this.removeRequest(userAccessId);
                                }}>Reject</button>
                            </div>;
                        }) }
                    </div>
                </div>
            </div>
        </div>, document.getElementById("portal"));
    }

    addRequest(userAccessId, email, username) {
        let requests = Object.assign({}, this.state.requests);
        requests[userAccessId] = { email, username }
        this.setState({
            requests
        });
    }

    removeRequest(userAccessId) {
        let requests = Object.assign({}, this.state.requests);
        delete (requests[userAccessId]);
        this.setState({
            requests
        });
    }

    enable() {
        this.surrenderModal.current.removeAttribute("disabled");
    }

    disable() {
        this.surrenderModal.current.setAttribute("disabled", true);
    }

}