import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem, Image } from "react-bootstrap";
import "./Home.css";
import { invokeApig } from '../libs/awsLib';
import { Link } from "react-router-dom";
import Youtube from "react-youtube"

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }
  
  async componentDidMount() {
	   this.setState({ isLoading: false });
	}

	// reservations() {
	//   return invokeApig({ path: "/reservations" });
	// }

	// renderReservationsList(reservations) {
	//   return [{}].concat(reservations).map(
	// 	(reservation, i) =>
	// 	  i !== 0
	// 		? <ListGroupItem
	// 			key={reservation.reservationId}
	// 			href={`/reservations/${reservation.reservationId}`}
	// 			onClick={this.handleReservationClick}
	// 			header={reservation.content.trim().split("\n")[0]}
	// 		  >
	// 			{"Created: " + new Date(reservation.createdAt).toLocaleString()}
	// 		  </ListGroupItem>
	// 		: <ListGroupItem
	// 			key="new"
	// 			href="/reservations/new"
	// 			onClick={this.handleReservationClick}
	// 		  >
	// 			<h4>
	// 			  <b>{"\uFF0B"}</b> Create a new reservation
	// 			</h4>
	// 		  </ListGroupItem>
	//   );
	// }

	// handleReservationClick = event => {
	//   event.preventDefault();
	//   this.props.history.push(event.currentTarget.getAttribute("href"));
	// }

	renderBanner() {
		return (
			<div className="lander">
				<h1>SaaaS</h1>
				<p>Sysadmin-as-a-Service</p>
				{!this.props.isAuthenticated && this.renderLoginSignup()}
			</div>
		);
	}

	renderLoginSignup() {
		return (
			<div>
				<Link to="/login" className="btn btn-info btn-lg">
					Login
				</Link>
				<Link to="/signup" className="btn btn-success btn-lg">
					Signup
				</Link>
			</div>	
		);
	}

	_onReady = (event) => {
	  this.setState({ player: event.target });
	};
  
	_onPlay = () => {
	  this.state.player.setPlaybackQuality('hd1080');
	};

  renderLandingPage() {
    return (
			<div>
				{/* <div style={{ textAlign:'center'}}>
					<div style={{display:'inline-block'}} className="header">Sysadmin-as-a-Service</div>
				</div> */}
				<div>
					<div style={{ textAlign:'center', margin: '0 0 40px'}}>
						<div style={{display:'inline-block', margin:'0 0 20px'}} >
							What if you could manage your EC2 and RDS instances like this?
						</div>
						<div>
							<Image style={{display:'inline-block', maxWidth: '100%'}} src={require('../assets/img/Example-Ec2.png')}/>
						</div>
					</div>
				</div>
				<div style={{ textAlign:'center'}}>
						<div style={{display:'inline-block'}} >
							<h2>Watch our demo!</h2>
						</div>
						<div style={{display:'block'}}>
							<Youtube
								videoId='fqjYo1_CzFg'
								opts={{height:265, width:350}}
								onReady={this._onReady}
								onPlay={this._onPlay}
							/>
						</div>
				</div>
				{/* <div>
					{this.props.isAuthenticated && this.renderLander()}
				</div> */}
				{/* <div>
					1) Register
					2) Add Payment Method
					1) Add cloud account(s)
				</div>
				<div>
					2) Select regions and features
				</div>
				<div>
					3) Download generated CloudFormation template
				</div>
				<div>
					4) Run CloudFormation Template
				</div>
				<div>
					5) Watch and enjoy the automation!
				</div> */}
				<hr/>
				<div style={{ textAlign:'center', margin:'40px 0 40px'}}>
						<div style={{display:'inline-block'}} >
							Questions? &nbsp; Comments? &nbsp; Ideas?
						</div>
						<div style={{display:'block'}}>
							<h1>Email us!</h1>
						</div>
						<div>
							info@saaas.cloud
						</div>
				</div>
			</div>
    );
  }

  render() {
    return (
      <div className="Home">
				{this.renderBanner()}
				<hr/>
				{/* {this.props.isAuthenticated ? this.renderLandingPage() : this.renderLander()} */}
				{this.renderLandingPage()}
      </div>
    );
  }
}