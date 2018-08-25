import React, { Component } from "react";
// import {
//   HelpBlock,
//   FormGroup,
//   FormControl,
//   ControlLabel,
//   ListGroup,
//   ListGroupItem,
//   PageHeader,
//   Button,
//   Modal,
//   Panel
// } from "react-bootstrap";
// import LoaderButton from "../components/LoaderButton";
import "./Profile.css";
// import {
//   AuthenticationDetails,
//   CognitoUserPool,
//   CognitoUser,
//   CognitoUserAttribute
// } from "amazon-cognito-identity-js";
// import config from "../config.json";
// import Phone from "react-phone-number-input";
// import "react-phone-number-input/rrui.css";
// import "react-phone-number-input/style.css";
// import "react-datetime/css/react-datetime.css";
// import Datetime from "react-datetime";
// import Moment from 'react-moment';
// import { getCognitoUserAttributes, authUser, getCurrentUser } from '../libs/awsLib';
// import { invokeApig } from "../libs/awsLib";
// import { StripeProvider } from 'react-stripe-elements';
//import AddCreditCard  from "../components/CreditCard/AddCreditCard";
import PaymentMethods  from "../components/PaymentMethods/PaymentMethods";

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // isLoading: true,
      // showAddPaymentMethodModal: false,
			// isRefreshing: false,
      // isEditing: false,
      // user: null
      // email: "",
      // firstName: "",
      // password: ""
    };
    
    // this.handleAddPaymentMethodHide = this.handleAddPaymentMethodHide.bind(this);
    // this.handleAddPaymentMethodShow = this.handleAddPaymentMethodShow.bind(this);
    // this.handleAddPaymentMethod = this.handleAddPaymentMethod.bind(this);
  }

  async componentDidMount() {
    //try {      
      if (!this.props.isAuthenticated) {
        return;
      }
      
    //   const results = await this.user();
    //   this.setState({ user: results[0] });

    //   let cognitoUser = getCurrentUser();
    //   let self = this;
    //   if (cognitoUser != null) {
    //       cognitoUser.getSession(function(err, session) {
    //           if (err) {
    //               alert(err);
    //               return;
    //           }
    //           console.log('session validity: ' + session.isValid());
    //       });
    //       let result = cognitoUser.getUserAttributes(function(err, result) {
    //           if (err) {
    //               alert(err);
    //               return;
    //           }
    //           for (let i = 0; i < result.length; i++) {
    //             if (result[i].getName() === 'email') {
    //               self.setState({
    //                 email: result[i].getValue()
    //               });}
    //             if (result[i].getName() === 'given_name') {
    //               self.setState({
    //                 firstName: result[i].getValue()
    //               });}
    //             if (result[i].getName() === 'family_name') {
    //               self.setState({
    //                 lastName: result[i].getValue()
    //               });}
    //             if (result[i].getName() === 'phone_number') {
    //               self.setState({
    //                 phoneNumber: result[i].getValue()
    //               });}
    //             if (result[i].getName() === 'birthdate') {
    //               self.setState({
    //                 birthDate: result[i].getValue()
    //               });}
    //           }
    //       });
    //     }
    // } catch (e) {
    //   alert(e);
    // }
    
	  // this.setState({
    //   isLoading: false,
    //   isRefreshing: false
    // });
 }
  
	// async manualUpdate() {
	// 	try {
  //     const results = await this.user();
  //     this.setState({ user: results[0] });
	// 	} catch (e) {
	// 	  alert(e);
	// 	}
	// 	this.setState({
  //     isLoading: false,
  //     isRefreshing: false
  //   });
	// }

	// user() {
	//   return invokeApig({ path: `/users/${this.props.match.params.id}` });
  // }


/*
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

  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }*/

  // handleChange = event => {
  //   this.setState({
  //     [event.target.id]: event.target.value
  //   });
  // }
/*
	handleSubmit = async event => {
	  event.preventDefault();

	  this.setState({ isLoading: true });

	  try {
		const newUser = await this.signup(this.state.email, this.state.password, this.state.firstName, this.state.lastName, this.state.phoneNumber, this.state.birthDate);
		this.setState({
		  newUser: newUser
		});
	  } catch (e) {
		alert(e);
	  }

	  this.setState({ isLoading: false });
    }
    
    getCurrentCognitoUser() {
      const userPool = new CognitoUserPool({
        UserPoolId: config.cognito.USER_POOL_ID,
        ClientId: config.cognito.APP_CLIENT_ID
          });
      var cognitoUser = userPool.getCurrentUser();

      alert(cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          alert(err);
          return;
        }
      }))
    }

	signup(email, password, firstName, lastName, phoneNumber, birthDate) {
	  const userPool = new CognitoUserPool({
		UserPoolId: config.cognito.USER_POOL_ID,
		ClientId: config.cognito.APP_CLIENT_ID
      });
	  
    var attributeList = [];
    
    var birthDateString = new Date(birthDate).toISOString().substring(0,10);
    var updatedAtString = String(Math.floor((new Date).getTime()/1000));
    
	  var dataFirstName = {
		  Name : 'given_name',
		  Value : firstName
	  };
	  var dataLastName = {
		  Name : 'family_name',
		  Value : lastName
	  };
	  var dataPhoneNumber = {
		  Name : 'phone_number',
		  Value : phoneNumber
	  };
	  var dataTimeZone = {
		  Name : 'zoneinfo',
		  Value : 'America/Chicago'
	  };
	  var dataLocale = {
		  Name : 'locale',
		  Value : 'en-US'
	  };
	  var dataUpdatedAt = {
		  Name : 'updated_at',
		  Value : updatedAtString
	  };
	  var dataBirthDate = {
		  Name : 'birthdate',
		  Value : birthDateString
    };
	  
	  var attributeFirstName = new CognitoUserAttribute(dataFirstName);
	  var attributeLastName = new CognitoUserAttribute(dataLastName);
	  var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);
	  var attributeTimeZone = new CognitoUserAttribute(dataTimeZone);
	  var attributeLocale = new CognitoUserAttribute(dataLocale);
	  var attributeUpdatedAt = new CognitoUserAttribute(dataUpdatedAt);
	  var attributeBirthDate = new CognitoUserAttribute(dataBirthDate);
	  
	  attributeList.push(attributeFirstName);
      attributeList.push(attributeLastName);
      attributeList.push(attributePhoneNumber);
      attributeList.push(attributeTimeZone);
      attributeList.push(attributeLocale);
      attributeList.push(attributeUpdatedAt);
      attributeList.push(attributeBirthDate);

	  return new Promise((resolve, reject) =>
		userPool.signUp(email, password, attributeList, null, (err, result) => {
		  if (err) {
			reject(err);
			return;
		  }

		  resolve(result.user);
		})
	  );
	}

	e(user, confirmationCode) {
	  return new Promise((resolve, reject) =>
		user.confirmRegistration(confirmationCode, true, function(err, result) {
		  if (err) {
			reject(err);
			return;
		  }
		  resolve(result);
		})
	  );
	}

	authenticate(user, email, password) {
	  const authenticationData = {
		Username: email,
		Password: password
	  };
	  const authenticationDetails = new AuthenticationDetails(authenticationData);

	  return new Promise((resolve, reject) =>
		user.authenticateUser(authenticationDetails, {
		  onSuccess: result => resolve(),
		  onFailure: err => reject(err)
		})
	  );
	}
*/
  // renderForm() {
  //   return (
      // <form onSubmit={this.handleSubmit}>
      //   <FormGroup controlId="email" bsSize="medium">
      //     <ControlLabel>Email</ControlLabel>
      //     <FormControl
      //       disabled={!this.state.isEditing}
      //       autoFocus
      //       type="email"
      //       value={this.state.email}
      //       onChange={this.handleChange}
      //     />
      //   </FormGroup>
      //   <FormGroup controlId="firstName" bsSize="medium">
      //     <ControlLabel>First Name</ControlLabel>
      //     <FormControl
      //       disabled={!this.state.isEditing}
      //       value={this.state.firstName}
      //       onChange={this.handleChange}
      //       type="text"
      //     />
      //   </FormGroup>
      //   <FormGroup controlId="lastName" bsSize="medium">
      //     <ControlLabel>Last Name</ControlLabel>
      //     <FormControl
      //       disabled={!this.state.isEditing}
      //       value={this.state.lastName}
      //       onChange={this.handleChange}
      //       type="text"
      //     />
      //   </FormGroup>
      //   <FormGroup controlId="phoneNumber" bsSize="medium">
      //     <ControlLabel>Phone Number</ControlLabel>
      //     <Phone
      //         disabled={!this.state.isEditing}
      //         value={ this.state.phoneNumber }
      //         country="US"
      //         onChange={ phoneNumber => this.setState({ phoneNumber }) }
      //     />
      //   </FormGroup>
      //   <FormGroup controlId="birthDate" bsSize="medium">
      //     <ControlLabel>Birth Date</ControlLabel>
      //     <FormControl
      //       disabled={!this.state.isEditing}
      //       value={ this.state.birthDate }
      //       onChange={ birthDate => this.setState({ birthDate }) }
      //       type="text"
      //     />
      //   </FormGroup>
      // </form>
  //     <div>
  //       </div>
  //   );
  // }
  
  // handleAddPaymentMethod(token) {
  //   this.addPaymentMethod({
  //     token: token,
  //   }).then(this.setState({
  //     showAddPaymentMethodModal: false,
  //     isRefreshing: true
  //   }));

  //   //this.manualUpdate();
  // }
  
  // addPaymentMethod(paymentMethod) {
  //   return invokeApig({
  //     path: "/paymentmethods",
  //     method: "POST",
  //     body: paymentMethod
  //   });
  // }
  
  // handleAddPaymentMethodShow(event) {
  //   this.setState({
  //     showAddPaymentMethodModal: true
  //   })
  // }

  // handleAddPaymentMethodHide(event) {
  //   this.setState({
  //     showAddPaymentMethodModal: false
  //   })
  // }

  // renderPaymentMethodsList(user) {
  //   // [{}].concat(paymentMethods).map(
  //   //   (paymentMethod, i) =>
  //       //i !== 0
  //   let paymentMethodsList = [];
  //   //if (this.state.user) {
  //     if (user.stripeCustomer != null) {
  //       Array.from(user.stripeCustomer.sources.data).forEach((card) => {
  //         paymentMethodsList.push(
  //           <ListGroupItem
  //             key={card.id}
  //             //href={`/paymentmethods/${paymentMethod.paymentMethodId}`}
  //             //onClick={this.handlePaymentMethodClick}
  //             header={card.brand.trim().split("\n")[0]}
  //             >
  //             {"Last 4 digits: " + card.last4}
  //           </ListGroupItem>
  //         )
  //       });
  //     }
  //   //}
  //   if (paymentMethodsList.length < 1) {
  //     paymentMethodsList.push(
  //       <div key="none">
  //         No payment methods have been added. Add a payment method to enable features.
  //       </div>
  //     )
  //   }
  //   return paymentMethodsList;
  // }

  // render() {
  //   return (
  //       <div>
  //         <div>
  //           {/* <PageHeader>Your Payment Methods</PageHeader> */}
  //           <div style={{overflow: 'hidden'}}>
  //             <div style={{float: 'left'  }}>
  //               <PageHeader>Payment Methods</PageHeader>
  //             </div>
  //             <div style={{float: 'right'}}>
  //               <Button
  //               bsStyle="primary"
  //               bsSize="small"
  //               onClick={ () => this.handleAddPaymentMethodShow()}
  //               >
  //                   + Add Payment Method
  //               </Button>
  //             </div>
  //           </div>
  //           <div>
  //             <ListGroup>
  //               {!this.state.isLoading && this.renderPaymentMethodsList(this.state.user)}
  //             </ListGroup>
  //           </div>
  //         </div>
  //       <Modal show={this.state.showAddPaymentMethodModal} onHide={this.handleAddPaymentMethodHide}>
  //         <Modal.Header closeButton>
  //           <Modal.Title>Add Payment Method</Modal.Title>
  //         </Modal.Header>
  //         <Modal.Body>
  //           <StripeProvider apiKey="pk_test_yDDg994Tr2wo2xz2yopKIVT5">
  //             <AddCreditCard
  //               addPaymentMethodCallback={this.handleAddPaymentMethod}

  //               />
  //           </StripeProvider>
  //         </Modal.Body>
  //         {/* <Modal.Footer>
  //           <Button onClick={this.handleAddPaymentMethodHide}>Cancel</Button>
  //           <Button onClick={this.handleAddPaymentMethodSubmit}>Add</Button>
  //         </Modal.Footer> */}
  //       </Modal>
  //     </div>
  //   );
  // }

  render() {
    return (
      <div>
        <PaymentMethods {...this.props} />
      </div>
    )
  }
}