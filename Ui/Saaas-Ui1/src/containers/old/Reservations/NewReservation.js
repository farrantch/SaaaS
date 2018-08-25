import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config.json";
import "./NewReservation.css";
import { invokeApig } from "../libs/awsLib";

export default class NewReservation extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      content: ""
    };
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

	handleSubmit = async event => {
	  event.preventDefault();

	  // if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
		// alert("Please pick a file smaller than 5MB");
		// return;
	  // }

	  this.setState({ isLoading: true });

	  try {
		await this.createReservation({
		  content: this.state.content
		});
		this.props.history.push("/reservations");
	  } catch (e) {
		alert(e);
		this.setState({ isLoading: false });
	  }
	}

	createReservation(reservation) {
	  return invokeApig({
		path: "/reservations",
		method: "POST",
		body: reservation
	  });
	}

  render() {
    return (
      <div className="NewReservation">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
            />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create"
            loadingText="Creating..."
          />
        </form>
      </div>
    );
  }
}