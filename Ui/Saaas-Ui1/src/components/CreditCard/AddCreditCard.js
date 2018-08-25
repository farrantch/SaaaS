import React, { Component } from "react";
import { invokeApig } from "../../libs/awsLib";
import { Link } from "react-router-dom";
import { Elements } from 'react-stripe-elements';
import InjectedAddCreditCardForm from "./AddCreditCardForm";
 
export default class AddCreditCard extends Component {
    render() {
      return (
        <Elements>
          <InjectedAddCreditCardForm
            addPaymentMethodCallback={this.props.addPaymentMethodCallback}
            isRefreshing={this.props.isRefreshing}
            />
        </Elements>
      );
    }
  };