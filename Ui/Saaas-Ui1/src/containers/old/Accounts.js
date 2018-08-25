import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem, Panel, PanelGroup } from "react-bootstrap";
import "./Accounts.css";
import { invokeApig } from "../libs/awsLib";
import { Link } from "react-router-dom";
import { AccountsDashboard } from "../components/Accounts/AccountsDashboard"

export default class Accounts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // isLoading: true,
			// accounts: [],
			// features: []
		};
		
	//	this.reloadPage = this.reloadPage.bind(this);
  }
  
  // async componentDidMount() {
	//   if (!this.props.isAuthenticated) {
	// 		return;
	//   }

	//   try {
	// 		const accountResults = await this.getAccounts();
	// 		const featureResults = await this.getFeatures();
	// 		this.setState({ accounts: accountResults });
	// 		this.setState({ features: featureResults });
	//   } catch (e) {
	// 	alert(e);
	//   }
	//   this.setState({ isLoading: false });
	// }
	
	// reloadPage(event) {
  //   //e.preventDefault()
	// 	// this.setState({ e: e }, () => {
	// 	// 	this.forceUpdate();
	// 	// });
	// 	//this.setState({
	// 	this.setState({ event: event }, () => {
	// 		isLoading: true
	// 		//this.forceUpdate();
	// 	});
	// 		//isLoading: true
	// 	//});
	// }

	// getAccounts() {
	//   return invokeApig({ path: "/accounts" });
	// }

	// getFeatures() {
	//   return invokeApig({ path: "/features" });
	// }

	// updateAccount(account) {
	// 	try {
	// 		await invokeApig({
	// 			path: `/accounts/${this.props.account.accountId}`,
	// 			method: "PUT",
	// 			body: account
	// 		});
	// 	} catch (event) {
	// 		alert(event);
	// 	}
	// 	return invokeApig({
	// 	  path: `/accounts/${this.props.account.accountId}`,
	// 	  method: "PUT",
	// 	  body: account
	// 	});
	// }
	
	// deleteAccount(accountId) {
	// 	return invokeApig({
	// 	  path: `/accounts/${accountId}`,
	// 	  method: "DELETE"
	// 	});
	// }

	// renderAccountsList(accounts) {
	//   return [{}].concat(accounts).map(
	// 	(account, i) =>
	// 	  i !== 0
	// 		? <Panel
	// 			key={account.accountId}
	// 			accordian
	// 			href={`/acccounts/${account.accountId}`}
	// 			onClick={this.handleAccountClick}
	// 			header={account.accountType.trim().split("\n")[0]}
	// 		  >
	// 			{"Created: " + new Date(account.createdAt).toLocaleString()}
	// 		  </Panel>
	// 		: <Panel
	// 			key="new"
	// 			accordian
	// 			href="/accounts/new"
	// 			onClick={this.handleAccountClick}
	// 		  >
	// 			<h4>
	// 			  <b>{"\uFF0B"}</b> Create a new account
	// 			</h4>
	// 		  </Panel>
	//   );
	// }

	// handleReservationClick = event => {
	//   event.preventDefault();
	//   this.props.history.push(event.currentTarget.getAttribute("href"));
	// }

  render() {
		// this.componentAccountsDidMount();
		// this.componentFeaturesDidMount();
    return (
			<div>
				<Link to="/accounts/new" className="btn btn-info btn-lg">
					+ Add Account
				</Link>
				<div className="accounts">
					<PageHeader>Your Accounts</PageHeader>
				<div>
				</div>
					{/* <PanelGroup>
						{!this.state.isLoading && this.renderAccountsList(this.state.accounts)}
					</PanelGroup> */}

					{/* <AllAccounts accounts={this.state.accounts}/> */}
					<AccountsDashboard/>
				</div>
			</div>
    );
  }
}