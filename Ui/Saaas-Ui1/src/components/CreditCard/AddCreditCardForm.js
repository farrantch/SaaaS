import React, { Component } from "react";
import { Link } from "react-router-dom";
import { injectStripe } from 'react-stripe-elements';
import CardSection from './CardSection';
import LoaderButton from '../LoaderButton'
import { Button, Glyphicon, FormControl, ControlLabel, FormGroup } from "react-bootstrap"
import './AddCreditCardForm.css'

class AddCreditCardForm extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        nameOnCard: ""
      };
    }
    handleSubmit = (event) => {
        // We don't want to let default form submission happen here, which would refresh the page.
        event.preventDefault();

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        this.props.stripe.createToken({name: this.state.nameOnCard}).then(({token}) => {
            console.log('Received Stripe token:', token);
            this.props.addPaymentMethodCallback(token);
        });
    }

    handleChange = event => {
      this.setState({
        [event.target.id]: event.target.value
      });
    }

    validateForm() {
        return(
            this.state.nameOnCard.length > 2 && 
            this.state.nameOnCard.length < 40
        );
    }

    render() {
        return (
        <form onSubmit={this.handleSubmit}>
            <div>
                <FormGroup controlId="nameOnCard">
                    <ControlLabel>Name on card</ControlLabel>
                    <FormControl
                        type="text"
                        placeholder="Enter name"
                        autoFocus
                        onChange={this.handleChange}
                        style={{margin:'0 0 20px'}}
                        value={this.state.nameOnCard}
                    />
                </FormGroup>
            </div>
            <div>
                <CardSection />
            </div>
            <button
                // bsStyle='primary'
                className='button'
                style={{margin:'20px 0 0', width:'100%'}}
                disabled={!this.validateForm()}
                >
                Add Card
            </button>
        </form>
        );
    }
}

export default injectStripe(AddCreditCardForm);