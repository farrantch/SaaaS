import React, { Component } from "react";
// import {
//     //PageHeader,
//     // ListGroup,
//     // ListGroupItem,
//     // Panel,
//     // PanelGroup,
//     //Button
//  } from "react-bootstrap";
import "./Dashboard.css";
//import { invokeApig } from "../libs/awsLib";
import { Link } from "react-router-dom";
import { AccountsDashboard } from "../components/Accounts/AccountsDashboard"

export default class Dashboard extends Component {
    constructor(props) {
      super(props);
  
      this.state = {};
    }
        
    async componentDidMount() {
        if (!this.props.isAuthenticated) {
            return;
        }
    }

    render() {
        return (
            <div>
                {/* <div className="dashboard" style={{overflow: 'hidden'}}>
                    <div style={{float: 'left'  }}>
                        <PageHeader>Your Accounts</PageHeader>
                    </div>
                    <div style={{float: 'right'}}>
                        <Button
                        to="/accounts/new"
                        bsStyle="primary"
                        bsSize="small"
                        >
                            + Add Account
                        </Button>
                    </div>
                </div> */}
                <div>
                    <AccountsDashboard {...this.props}/>
                </div>
            </div>
        );
    }
}