import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Reservations.css";
import { invokeApig } from '../libs/awsLib';
import { Link } from "react-router-dom";

export default class Reservations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      reservations: []
    };
  }
  
  async componentDidMount() {
	  if (!this.props.isAuthenticated) {
			return;
	  }

	  try {
			const results = await this.reservations();
			this.setState({ reservations: results });
	  } catch (e) {
			alert(e);
	  }

	  this.setState({ isLoading: false });
	}

	reservations() {
	  return invokeApig({ path: "/reservations" });
	}

	renderReservationsList(reservations) {
	  return [{}].concat(reservations).map(
		(reservation, i) =>
		  i !== 0
			? <ListGroupItem
				key={reservation.reservationId}
				href={`/reservations/${reservation.reservationId}`}
				onClick={this.handleReservationClick}
				header={reservation.content.trim().split("\n")[0]}
			  >
				{"Created: " + new Date(reservation.createdAt).toLocaleString()}
			  </ListGroupItem>
			: <ListGroupItem
				key="new"
				href="/reservations/new"
				onClick={this.handleReservationClick}
			  >
				<h4>
				  <b>{"\uFF0B"}</b> Create a new reservation
				</h4>
			  </ListGroupItem>
	  );
	}

	handleReservationClick = event => {
	  event.preventDefault();
	  this.props.history.push(event.currentTarget.getAttribute("href"));
	}

  render() {
    return (
      <div className="reservations">
        <PageHeader>Your Reservations</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderReservationsList(this.state.reservations)}
        </ListGroup>
      </div>
    );
  }
}