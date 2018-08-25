import React, { Component } from "react";
import { invokeApig } from "../libs/awsLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config.json";
import "./Reservation.css";

export default class Reservation extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
			isLoading: null,
			isDeleting: null,
			reservation: null,
			content: ""
    };
  }

  async componentDidMount() {
    try {
      const results = await this.getReservation();
      this.setState({
        reservation: results,
        content: results.content
      });
    } catch (e) {
      alert(e);
    }
  }

  getReservation() {
    return invokeApig({ path: `/reservations/${this.props.match.params.id}` });
  }

	validateForm() {
	  return this.state.content.length > 0;
	}

	formatFilename(str) {
	  return str.length < 50
		? str
		: str.substr(0, 20) + "..." + str.substr(str.length - 20, str.length);
	}

	handleChange = event => {
	  this.setState({
		[event.target.id]: event.target.value
	  });
	}

	handleFileChange = event => {
	  this.file = event.target.files[0];
	}
	
	saveReservation(reservation) {
	  return invokeApig({
		path: `/reservations/${this.props.match.params.id}`,
		method: "PUT",
		body: reservation
	  });
	}

	handleSubmit = async event => {
	  let uploadedFilename;

	  event.preventDefault();

	  // if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
		// alert("Please pick a file smaller than 5MB");
		// return;
	  // }

	  this.setState({ isLoading: true });

	  try {
		// if (this.file) {
		  // uploadedFilename = (await s3Upload(this.file))
			// .Location;
		// }

		await this.saveReservation({
		  ...this.state.reservation,
		  content: this.state.content
		});
		this.props.history.push("/reservations");
	  } catch (e) {
		alert(e);
		this.setState({ isLoading: false });
	  }
	}

	deleteReservation() {
	  return invokeApig({
		path: `/reservations/${this.props.match.params.id}`,
		method: "DELETE"
	  });
	}

	handleDelete = async event => {
	  event.preventDefault();

	  const confirmed = window.confirm(
		"Are you sure you want to delete this reservation?"
	  );

	  if (!confirmed) {
		return;
	  }

	  this.setState({ isDeleting: true });

	  try {
		await this.deleteReservation();
		this.props.history.push("/reservations");
	  } catch (e) {
		alert(e);
		this.setState({ isDeleting: false });
	  }
	}

	render() {
	  return (
		<div className="Reservation">
		  {this.state.reservation &&
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
				text="Save"
				loadingText="Saving..."
			  />
			  <LoaderButton
				block
				bsStyle="danger"
				bsSize="large"
				isLoading={this.state.isDeleting}
				onClick={this.handleDelete}
				text="Delete"
				loadingText="Deleting..."
			  />
			</form>}
		</div>
	  );
	}
}