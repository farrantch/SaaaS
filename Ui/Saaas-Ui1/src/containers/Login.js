import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import config from "../config.json";
import LoaderButton from "../components/LoaderButton";

import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
	  isLoading: false,
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
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
      await this.login(this.state.email, this.state.password);
      this.props.history.push("/dashboard");
      this.props.userHasAuthenticated(true);
	  } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
	  }
  }
  
  renderBanner() {
		return (
			<div className="lander">
				<h1>SaaaS</h1>
				<p>Sysadmin-as-a-Service</p>
			</div>
		);
	}
  
  login(email, password) {
	  const userPool = new CognitoUserPool({
		UserPoolId: config.cognito.USER_POOL_ID,
		ClientId: config.cognito.APP_CLIENT_ID
	  });
	  const user = new CognitoUser({ Username: email, Pool: userPool });
	  const authenticationData = { Username: email, Password: password };
	  const authenticationDetails = new AuthenticationDetails(authenticationData);

	  return new Promise((resolve, reject) =>
		user.authenticateUser(authenticationDetails, {
		  onSuccess: result => resolve(),
		  onFailure: err => reject(err)
		})
	  );
	}

  render() {
    return (
      <div className="Login">
        {this.renderBanner()}
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
		  <LoaderButton
		    block
		    bsSize="large"
		    disabled={!this.validateForm()}
		    type="submit"
		    isLoading={this.state.isLoading}
		    text="Login"
	        loadingText="Logging in..."
		  />
        </form>
      </div>
    );
  }
}