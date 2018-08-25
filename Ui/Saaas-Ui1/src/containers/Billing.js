import React, { Component } from "react";
import "./Billing.css";
import Transactions from "../components/Transactions/Transactions";


export default class Billing extends Component {
    constructor(props) {
      super(props);
  
      this.state = {

      };

    }
  
    async componentDidMount() {
        if (!this.props.isAuthenticated) {
          return;
        }
   }
   render() {
     return (
        <div>
        <Transactions {...this.props}/>
        </div>
     )
   }
}