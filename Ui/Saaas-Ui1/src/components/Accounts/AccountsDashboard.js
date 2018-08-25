import React from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
	Button,
	Modal,
	ListGroup,
	ListGroupItem,
	Well,
	PageHeader,
	FormGroup,
	FormControl,
	ControlLabel,
	Glyphicon,
	Alert
} from "react-bootstrap";
import { AccountTypeCollapse } from "./AccountTypeCollapse";
import mappings from "../../data/mappings.json";
import iamPolicyTemplate from "../../data/iamPolicyTemplate";
import LoaderButton from "../../components/LoaderButton";

const accountTypeMappings = mappings['accountTypes'];
// const iamPolicyTemplate = {
// 	"Version": "2012-10-17",
// 	"Statement": []
// }

export class AccountsDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			isRefreshing: false,
			isAddAcountLoading: false,
			userHasPayment: false,

			// Initial Data Load
			accounts: [],

			// Add region
			showAddRegion: false,
			addRegionSelectedRegion: null,
			addRegionList: [],
			addRegionSelectedAccount: null,

			// Delete Region
			showDeleteRegion: false,
			deleteRegionSelectedRegion: null,
			deleteRegionSelectedAccount: null,

			// Delete Account
			showDeleteAccount: false,
			deleteAccountSelectedAccount: null,

			// // Generate IAM Policy
			// showGenerateIamPolicy: false,
			// generatedIamPolicy: [],
			// generatedIamPolicySelectedAccount: null,

			// Add Account
			showAddAccount: false,
			addAccountId: "",
			addAccountName: "",
			addAccountType: "", // Default Value
		};

		this.updateAccount = this.updateAccount.bind(this);
		this.deleteAccount = this.deleteAccount.bind(this);
		this.listAccounts = this.listAccounts.bind(this);

		// Add Region Binds
		this.handleAddRegionSelect = this.handleAddRegionSelect.bind(this);
		this.handleAddRegionHide = this.handleAddRegionHide.bind(this);
		this.handleAddRegionSubmit = this.handleAddRegionSubmit.bind(this);
		this.handleAddRegionShow = this.handleAddRegionShow.bind(this);

		// Delete Region Binds
		this.handleDeleteRegionHide = this.handleDeleteRegionHide.bind(this);
		this.handleDeleteRegionShow = this.handleDeleteRegionShow.bind(this);
		this.handleDeleteRegionSubmit = this.handleDeleteRegionSubmit.bind(this);
		
		// Delete Account Binds
		this.handleDeleteAccountHide = this.handleDeleteAccountHide.bind(this);
		this.handleDeleteAccountShow = this.handleDeleteAccountShow.bind(this);
		this.handleDeleteAccountSubmit = this.handleDeleteAccountSubmit.bind(this);

		// Feature Binds
		this.handleAddFeature = this.handleAddFeature.bind(this);
		this.handleDeleteFeature = this.handleDeleteFeature.bind(this);

		// // Generate IAM Policy Binds
		// this.handleGenerateIamPolicyShow = this.handleGenerateIamPolicyShow.bind(this);
		// this.handleGenerateIamPolicyHide = this.handleGenerateIamPolicyHide.bind(this);

		// Add Account Binds
		this.handleAddAccountHide = this.handleAddAccountHide.bind(this);
		this.handleAddAccountShow = this.handleAddAccountShow.bind(this);
		this.handleAddAccountSubmit = this.handleAddAccountSubmit.bind(this);
	}
  
	async componentDidMount() {
		try {
			  const accountResults = await this.listAccounts();
			  const profileResults = await this.getUser();

			  if(profileResults[0].stripeCustomer) {
				  if(profileResults[0].stripeCustomer.sources.data.length > 1 ) {
					this.setState({
						userHasPayment: true
					})
				  }
			  }

			  this.setState({
				  accounts: accountResults,
				  profile: profileResults[0],
				  userHasPayment: (profileResults[0].stripeCustomer)
				});
		} catch (e) {
		  alert(e);
		}
		this.setState({
			isLoading: false,
			isRefreshing: false
		});
	}

	async manualUpdate() {
		try {
			  const accountResults = await this.listAccounts();
			  this.setState({ accounts: accountResults });
		} catch (e) {
		  alert(e);
		}
		this.setState({ isLoading: false });
	}

	handleAddAccountHide() {
		this.setState({
			showAddAccount: false
		});
	}

	handleAddAccountShow() {
		this.setState({
			showAddAccount: true,
			addAccountType: "aws"
		});
	}

	handleAddAccountChange = event => {
		this.setState({
		  [event.target.id]: event.target.value
		});
	}

	handleAddAccountSubmit = async event => {
		event.preventDefault();
		this.setState({ isAddAcountLoading: true });
		//alert(this.state.addAccountId + "\n" + this.state.addAccountType + "\n"  + this.state.addAccountName);
		try {
			// alert(JSON.stringify(this.state));
			await this.createAccount({
				accountId: this.state.addAccountId,
				accountType: this.state.addAccountType,
				accountName: this.state.addAccountName,
				regions: []
			});
		} catch(e) {
			alert(e);
			this.setState({ isAddAcountLoading: false });
		}
		this.setState({
			showAddAccount: false,
			addAccountId: "",
			addAccountType: "",
			addAccountName: "",
			isAddAcountLoading: false
		});

		this.manualUpdate();
	}

	validateAddAccountForm() {
		return(
			this.state.addAccountId.length === 12 &&
			this.state.addAccountId.match(/^[0-9]+$/) != null
		);
	}

	createAccount(account) {
	  return invokeApig({
		path: "/accounts",
		method: "POST",
		body: account
	  });
	}

	// DONE
	listAccounts() {
		return invokeApig({ path: "/accounts" });
	}

	// DONE
	updateAccount(account) {
		try {
			return invokeApig({
				path: `/accounts/${account.accountId}`,
				method: "PUT",
				body: account
			});
		} catch (event) {
			alert(event);
		}
	}

	// DONE
	deleteAccount(accountId) {
		try {
			return invokeApig({
				path: `/accounts/${accountId}`,
				method: "DELETE"
			});
		} catch (event) {
			alert(event);
		}
	}
	
    getUser() {
        return invokeApig({ path: `/users/${this.props.match.params.id}` });
	}

	// DONE
	handleAddRegionSelect(event) {
		event.preventDefault();
		this.setState({
			addRegionSelectedRegion: event.target.getAttribute('value')
		});
	}

	// DONE
	handleAddRegionHide() {
		this.setState({
			showAddRegion: false,
			addRegionList: [],
			addRegionSelectedRegion: null,
			addRegionSelectedAccount: null
		});
	}

	// DONE
	handleDeleteRegionHide() {
		this.setState({
			showDeleteRegion: false,
			deleteRegionSelectedRegion: null,
			deleteRegionSelectedRegion: null
		});
	}
	
	// DONE
	handleDeleteAccountHide() {
		this.setState({
			showDeleteAccount: false,
			deleteAccountSelectedAccount: null
		});
	}

	handleAddFeature(account, region, feature) {

		// Construct minimized feature object
		let featureToAdd = {
			"name": feature.name,
			"group": feature.group
		}

		// Add Feature to FeatureList
		region.features.push(featureToAdd);

		// Replace region with new region
		let regionIndex = account.regions.findIndex((r) => r.name === region.name);
		account.regions.splice(regionIndex, 1, region);

		// Replace account with new account
		//let accountIndex =

		this.updateAccount({
			accountId: account.accountId,
			accountType: account.accountType,
			accountName: account.accountName,
			createdAt: account.createdAt,
			regions: account.regions
		});

		this.setState({
			isRefreshing: true
		})

		//this.manualUpdate();
	}

	handleDeleteFeature(account, region, feature) {

		// Remove Feature from FeatureList
		let featureIndex = region.features.findIndex((f) => f.name === feature.name);
		region.features.splice(featureIndex, 1);

		// Replace region with new region
		let regionIndex = account.regions.findIndex((r) => r.name === region.name);
		account.regions.splice(regionIndex, 1, region);

		this.updateAccount({
			accountId: account.accountId,
			accountType: account.accountType,
			accountName: account.accountName,
			createdAt: account.createdAt,
			regions: account.regions
		});
		
		this.setState({
			isRefreshing: true
		})
		//this.manualUpdate();
	}	s

	// DONE
	getAvailableRegions(account){
		let availableRegions = [];
		let regionList = [];
		//let accountType= account.accountType;
		let configuredRegions = account.regions;

		// Set region list
		regionList = accountTypeMappings.find((accountType) => accountType.name === account.accountType).regionList.slice(0);

		// Remove regions already configured
		if (configuredRegions) {
			for (let region of configuredRegions) {
				if (regionList.includes(region.name)) {
					regionList.splice(regionList.indexOf(region.name), 1);
				}
			}
		}

		// Populate return array
		for (let region of regionList) {
			availableRegions.push(
				{region}
			)
		}

		return availableRegions;
	}

	// DONE
	handleAddRegionShow(account) {
		this.setState({
			showAddRegion: true,
			addRegionList: this.getAvailableRegions(account),
			addRegionSelectedRegion: "",
			addRegionSelectedAccount: account
		});
	}

	// DONE
	handleDeleteRegionShow(account, region) {
		this.setState({
			showDeleteRegion: true,
			deleteRegionSelectedRegion: region,
			deleteRegionSelectedAccount: account
		});
	}

	// DONE
	handleDeleteAccountShow(account) {
		this.setState({
			showDeleteAccount: true,
			deleteAccountSelectedAccount: account
		});
	}

	// DONE
	handleAddRegionSubmit = async event => {
		let regions = this.state.addRegionSelectedAccount.regions;
		let newRegion = {
			"name": this.state.addRegionSelectedRegion,
			"features": []
		}
		regions.push(newRegion);

		try {
			await this.updateAccount({
				accountId: this.state.addRegionSelectedAccount.accountId,
				accountType: this.state.addRegionSelectedAccount.accountType,
				accountName: this.state.addRegionSelectedAccount.accountName,
				createdAt: this.state.addRegionSelectedAccount.createdAt,
				regions: regions
			});
		} catch (event) {
			alert(event);
		}
			
		this.setState({
			showAddRegion: false,
			addRegionList: [],
			addRegionSelectedRegion: null,
			addRegionSelectedAccount: null
		});
	}
	
	// DONE
	handleDeleteRegionSubmit = async event => {	
		let regions = this.state.deleteRegionSelectedAccount.regions;
		for (var i = regions.length - 1; i >= 0; i--) {
			//	alert(JSON.stringify(this.state));
			if (regions[i].name === this.state.deleteRegionSelectedRegion.name) {
				regions.splice(i, 1);
			}
		}

		try {
			await this.updateAccount({
				accountId: this.state.deleteRegionSelectedAccount.accountId,
				accountType: this.state.deleteRegionSelectedAccount.accountType,
				accountName: this.state.deleteRegionSelectedAccount.accountName,
				createdAt: this.state.deleteRegionSelectedAccount.createdAt,
				regions: regions
			});
		} catch (event) {
			alert(event);
		}
		
		this.setState({
			showDeleteRegion: false,
			deleteRegionSelectedRegion: null,
			deleteRegionSelectedAccount: null
		});
	}

	// DONE
	// Improvements - Don't call manual update
	handleDeleteAccountSubmit = async event => {
		try {
			await this.deleteAccount(this.state.deleteAccountSelectedAccount.accountId);
		} catch (event) {
			alert(event);
		}
		
		this.setState({
			showDeleteAccount: false,
			deleteAccountSelectedAccount: null,
			//isLoading: true
		});

		this.manualUpdate();
	}

	renderAddPaymentAlert() {
		return(
			<div style={{margin:'10px'}}>
				<Alert bsStyle="danger">
					To enable features, you must first add a payment method to your profile.
				</Alert>
			</div>
		)
	}

    render() {
		const accountTypes = []; // aws, azure, gce, etc...
		
		//Double Array (AccountType x Accounts)
		const accounts = [];

		const accountTypesPanelGroup = [];
		const availableRegionsList = [];

		// 2nd Refactor
		

		// Loop through accounts and create "accountTypes" and "accounts" array
		Array.from(this.state.accounts).forEach((account) => {
			// if (account.accountType.indexOf(filterText) === -1) {
			//   return;
			// }

			// If accountType isn't in accountType array
			if (!accountTypes.includes(account.accountType)) {
			  // Add account type to array accountType
			  accountTypes.push(account.accountType);
			  // Initialize accounts array with an empty array
			  accounts[accounts.length] = [];
			}
			
			let accountTypeIndex = accountTypes.indexOf(account.accountType);
			accounts[accountTypeIndex].push(account);
		  });

		// Loop through accountTypes and create Panels with accounts and features passed in.
		for (var x = 0; x < accountTypes.length; x++) {
			let mapAccountType = accountTypeMappings.find((accountType) => accountType.name === accountTypes[x])
			// let accountStyle = "";
			// switch (accountTypes[x]) {
			// 	case "aws":
			// 		accountStyle="warning";
			// 		break;
			// 	case "gce":
			// 		accountStyle="success";
			// 		break;
			// 	case "azure":
			// 		accountStyle="info";
			// 		break;
			// 	default:
			// 		accountStyle="";
			// 		break;
			// }
			accountTypesPanelGroup.push(
				<Panel
					accordion="true"
					//activeKey={this.state.activeKey}
					key={accountTypes[x]}
					//onSelect={this.handleSelect}
					//bsStyle={accountStyle}
				>
					<Panel.Heading>
						<Panel.Title toggle>{mapAccountType.alias}</Panel.Title>
					</Panel.Heading>
					<Panel.Body collapsible>
						<AccountTypeCollapse
							accounts={accounts[x]}
							accountType={accountTypes[x]}
							addRegionCallback={this.handleAddRegionShow}
							deleteRegionCallback={this.handleDeleteRegionShow}
							updateAccountCallback={this.updateAccount}
							deleteAccountCallback={this.handleDeleteAccountShow}
							addFeatureCallback={this.handleAddFeature}
							deleteFeatureCallback={this.handleDeleteFeature}
							//generateIamPolicyCallback={this.handleGenerateIamPolicyShow}
							mapAccountType={mapAccountType}
							/>
					</Panel.Body>
				</Panel>
			);
		}

		// Create availableRegions ListGroup
		this.state.addRegionList.forEach((region) => {
			availableRegionsList.push(
				<ListGroupItem href="#" value={region.region} onClick={this.handleAddRegionSelect} key={region.name}>
					{region.region}
				</ListGroupItem>
			);
		})

		if (this.state.accounts.length < 1 && !this.isLoading) {
			accountTypesPanelGroup.push(
				<div key="none">
					No accounts have been added.
				</div>
			)
		}

        return (
			<div>
                <div className="header" style={{overflow: 'hidden'}}>
                    <div style={{float: 'left'  }}>
						{/* <PageHeader>Cloud Accounts</PageHeader> */}
						
						<h1>Cloud Accounts</h1>
                    </div>
                    <div style={{float: 'right', marginTop: '30px'}}>
                        <Button
						//to="/accounts/new"
						onClick={this.handleAddAccountShow}
                        bsStyle="primary"
						bsSize="small"
						disabled={!this.state.userHasPayment}
                        >
							<Glyphicon glyph="glyphicon glyphicon-plus"/>
							&nbsp;
                            Add Cloud Account
                        </Button>
                    </div>
                </div>
				{!this.state.userHasPayment && !this.state.isLoading && this.renderAddPaymentAlert()}
				<hr/>
				<div>
					{!this.state.isLoading && accountTypesPanelGroup}
				</div>
				<Modal show={this.state.showAddRegion} onHide={this.handleAddRegionHide}>
					<Modal.Header closeButton>
						<Modal.Title>Available Regions</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<ListGroup>
							{availableRegionsList}
						</ListGroup>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.handleAddRegionHide}>Cancel</Button>
						<Button bsStyle="primary" onClick={this.handleAddRegionSubmit}>Add</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.showDeleteRegion} onHide={this.handleDeleteRegionHide}>
					<Modal.Header closeButton>
						<Modal.Title>Delete Region</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Are you sure you want to delete this region?
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.handleDeleteRegionHide}>Cancel</Button>
						<Button bsStyle="danger" onClick={this.handleDeleteRegionSubmit}>Delete</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.showDeleteAccount} onHide={this.handleDeleteAccountHide}>
					<Modal.Header closeButton>
						<Modal.Title>Delete Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Are you sure you want to delete this account?
					</Modal.Body>
					<Modal.Footer>
					<Button onClick={this.handleDeleteAccountHide}>Cancel</Button>
						<Button bsStyle="danger" onClick={this.handleDeleteAccountSubmit}>Delete</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.showAddAccount} onHide={this.handleAddAccountHide} bsSize="small">
					<Modal.Header closeButton>
						<Modal.Title>Add Cloud Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
					<form onSubmit={this.handleAddAccountSubmit}>
						<FormGroup controlId="addAccountType" bsSize="sm">
							<ControlLabel>Account Type</ControlLabel>
							<FormControl
							onChange={this.handleAddAccountChange}
							value={this.state.addAccountType}
							componentClass="select" 
							placeholder="select..." >
								<option value="aws">Amazon Web Services</option>
								{/* <option value="azure">Microsoft Azure</option>
								<option value="gce">Google Compute Engine</option> */}
							</FormControl>
						</FormGroup>
						<FormGroup controlId="addAccountName" bsSize="sm">
							<ControlLabel>Account Name</ControlLabel>
							<FormControl
								onChange={this.handleAddAccountChange}
								value={this.state.addAccountName}
								placeholder="e.g. Development" 
								type="text">
							</FormControl>  
						</FormGroup>
						<FormGroup controlId="addAccountId" bsSize="sm">
						<ControlLabel>Account Id</ControlLabel>
							<FormControl
								onChange={this.handleAddAccountChange}
								value={this.state.addAccountId}
								placeholder="e.g. 123456789012" 
								type="text">
							</FormControl>  
						</FormGroup>
						<LoaderButton
							block
							bsStyle="primary"
							bsSize="sm"
							disabled={!this.validateAddAccountForm()}
							type="submit"
							isLoading={this.state.isAddAcountLoading}
							text="Add Account"
							loadingText="Adding..."
						/>
					</form>
					</Modal.Body>
					{/* <Modal.Footer>
						<Button onClick={this.handleAddAccountHide}>Cancel</Button>
						<Button bsStyle="primary" onClick={this.handleAddAccountSubmit}>Add</Button>
					</Modal.Footer> */}
				</Modal>
			</div>
        );
    }
}