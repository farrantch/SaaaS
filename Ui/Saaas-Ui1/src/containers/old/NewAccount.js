import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config.json";
import "./NewAccount.css";
import { invokeApig } from "../libs/awsLib";

export default class NewAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isEditing: null,
      accountId: "",
      accuuntName: "",
      //Default Value
      accountType: "aws"
    };
  }

  // Add more validation
  validateForm() {
    return this.state.accountId.length === 12 ;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  
	handleSubmit = async event => {
	  event.preventDefault();
	  this.setState({ isLoading: true });

	  try {
		await this.createAccount({
      accountId: this.state.accountId,
      accountType:  this.state.accountType,
      accountName:  this.state.accountName,
      regions: []
    }
    );
		this.props.history.push("/dashboard");
	  } catch (e) {
		alert(e);
	  }

	  this.setState({ isLoading: false });
  }
  
  createAccount(account) {
    return invokeApig({
      path: "/accounts",
      method: "POST",
      body: account
    });
  }
  
  render() {
    return (
      <div className="NewAccount">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="accountType" bsSize="sm">
            <ControlLabel>Account Type</ControlLabel>
            <FormControl
              value={-1}
              onChange={this.handleChange}
              value={this.state.accountType}
              componentClass="select" 
              placeholder="select..." >
            <option value="aws">Amazon Web Services</option>
            <option value="azure">Microsoft Azure</option>
            <option value="gce">Google Compute Engine</option>
            </FormControl>
        </FormGroup>
        <FormGroup controlId="accountName" bsSize="sm">
          <ControlLabel>Account Name</ControlLabel>
          <FormControl
            onChange={this.handleChange}
            //value={this.state.accountName}
            placeholder="e.g. Development" 
            type="text">
          </FormControl>  
        </FormGroup>
        <FormGroup controlId="accountId" bsSize="sm">
          <ControlLabel>Account Id</ControlLabel>
          <FormControl
            onChange={this.handleChange}
            placeholder="e.g. 123456789012" 
            type="text">
          </FormControl>  
        </FormGroup>
        <LoaderButton
          block
          bsStyle="primary"
          bsSize="sm"
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Add Account"
          loadingText="Adding..."
        />
        </form>
      </div>
    );
  }
}