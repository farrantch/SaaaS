import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Nav, NavItem, Navbar } from "react-bootstrap";
import "./App.css";
import Routes from "./Routes";
import RouteNavItem from "./components/RouteNavItem";
import { authUser, signOutUser } from "./libs/awsLib";
import { LinkContainer } from 'react-router-bootstrap';

class App extends Component {
	constructor(props) {
	  super(props);

	  this.state = {
			isAuthenticated: false,
			isAuthenticating: true
	  };
	}

	userHasAuthenticated = authenticated => {
	  this.setState({ isAuthenticated: authenticated });
	}
	
	handleLogout = event => {
	  signOutUser();
	  this.userHasAuthenticated(false);
	  this.props.history.push("/login");
	}
	
	async componentDidMount() {
	  try {
			if (await authUser()) {
				this.userHasAuthenticated(true);
			}
	  }
	  catch(e) {
		alert(e);
	  }

	  this.setState({ isAuthenticating: false });
	}
	
	render() {
	  const childProps = {
		isAuthenticated: this.state.isAuthenticated,
		userHasAuthenticated: this.userHasAuthenticated
	  };

	  return (
		!this.state.isAuthenticating &&
		<div className="App container">
		  <Navbar fluid collapseOnSelect>
			<Navbar.Header>
			  <Navbar.Brand>
					<Link to="/">SaaaS</Link>
			  </Navbar.Brand>
			  <Navbar.Toggle />
			</Navbar.Header>
			<Navbar.Collapse>
			  <Nav pullRight>
					<LinkContainer to="/docs"><RouteNavItem key="docs">Docs</RouteNavItem></LinkContainer>
				{this.state.isAuthenticated
				  ? [
							<LinkContainer to="/dashboard" key="dashboard"><RouteNavItem key="dashboard">Dashboard</RouteNavItem></LinkContainer>,
							<LinkContainer to="/billing" key="billing"><RouteNavItem key="billing">Billing</RouteNavItem></LinkContainer>,
							<LinkContainer to="/profile" key="profile"><RouteNavItem key="profile">Profile</RouteNavItem></LinkContainer>,
							<NavItem onClick={this.handleLogout} key="logout">Logout</NavItem>
						]
				  : [
					  <LinkContainer to="/signup"><RouteNavItem key="signup">
						Signup
					  </RouteNavItem></LinkContainer>,
					  <LinkContainer to="/login"><RouteNavItem key="login">
						Login
					  </RouteNavItem></LinkContainer>
					]}
			  </Nav>
			</Navbar.Collapse>
		  </Navbar>
		  <Routes childProps={childProps} />
		</div>
	  );
	}
}

export default withRouter(App);