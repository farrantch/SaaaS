import React, { Component } from "react";
import {
  FormGroup,
  FormControl,
  ControlLabe,
  ListGroup,
  ListGroupItem,
  PageHeader,
  Button,
  Modal,
  Panel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config.json";
import "./Payment.css";
import { invokeApig } from "../libs/awsLib";
import { Link } from "react-router-dom";
import { StripeProvider } from 'react-stripe-elements';
import AddCreditCard  from "../components/CreditCard/AddCreditCard";

export default class Payment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      showAddPaymentMethodModal: false,
			isRefreshing: false,
      paymentMethods: []
    };

    this.handlePaymentMethodClick = this.handlePaymentMethodClick.bind(this);
    this.handleAddPaymentMethodHide = this.handleAddPaymentMethodHide.bind(this);
    this.handleAddPaymentMethodShow = this.handleAddPaymentMethodShow.bind(this);
    this.handleAddPaymentMethodSubmit = this.handleAddPaymentMethodSubmit.bind(this);
    this.handleAddPaymentMethod = this.handleAddPaymentMethod.bind(this);
  }
  
  async componentDidMount() {
	  if (!this.props.isAuthenticated) {
	  	return;
	  }

	  try {
      const results = await this.paymentMethods();
      this.setState({ paymentMethods: results });
	  } catch (e) {
		  alert(e);
	  }
	  this.setState({ isLoading: false });
  }
  
	paymentMethods() {
	  return invokeApig({ path: "/paymentmethods" });
  }

  handlePaymentMethodClick(event) {
  }

  handleAddPaymentMethodShow(event) {
    this.setState({
      showAddPaymentMethodModal: true
    })
  }

  handleAddPaymentMethodHide(event) {
    this.setState({
      showAddPaymentMethodModal: false
    })
  }
  
	handleAddPaymentMethodSubmit = async event => {
	  //this.setState({ isLoading: true });

	  try {
		await this.createPaymentMethod({
      accountId: this.state.accountId,
      accountType:  this.state.accountType,
      accountName:  this.state.accountName,
      regions: []
    }
    );
		this.props.history.push("/payment");
	  } catch (e) {
		  alert(e);
	  }

	  //this.setState({ isLoading: false });
  }
  
  handleAddPaymentMethod(token) {
    this.addPaymentMethod({
      response: token
    });
  }

  addPaymentMethod(paymentMethod) {
    return invokeApig({
      path: "/paymentmethods",
      method: "POST",
      body: paymentMethod
    });
  }

  renderPaymentMethodsList(paymentMethods) {
    // [{}].concat(paymentMethods).map(
    //   (paymentMethod, i) =>
        //i !== 0
    let paymentMethodsList = [];
    Array.from(paymentMethods).forEach((paymentMethod) => {
      paymentMethodsList.push(
        <ListGroupItem
          key={paymentMethod.paymentMethodId}
          href={`/paymentmethods/${paymentMethod.paymentMethodId}`}
          onClick={this.handlePaymentMethodClick}
          header={paymentMethod.name.trim().split("\n")[0]}
          >
          {"Created: " + new Date(paymentMethod.createdAt).toLocaleString()}
        </ListGroupItem>
      )
    });
    if (paymentMethodsList.length < 1) {
      paymentMethodsList.push(
        <div key="none">
          No payment methods have been added. Add a payment method to enable features.
        </div>
      )
    }
    return paymentMethodsList;
  }
  
    render() {
      return (
        <div>
          <div>
            {/* <PageHeader>Your Payment Methods</PageHeader> */}
            <div style={{overflow: 'hidden'}}>
              <div style={{float: 'left'  }}>
                <PageHeader>Your Payment Methods</PageHeader>
              </div>
              <div style={{float: 'right'}}>
                <Button
                bsStyle="primary"
                bsSize="small"
                onClick={ () => this.handleAddPaymentMethodShow()}
                >
                    + Add Payment Method
                </Button>
              </div>
            </div>
            <div>
              <ListGroup>
                {this.renderPaymentMethodsList(this.state.paymentMethods)}
              </ListGroup>
            </div>
          </div>
          <Modal show={this.state.showAddPaymentMethodModal} onHide={this.handleAddPaymentMethodHide}>
            <Modal.Header closeButton>
              <Modal.Title>Add Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <StripeProvider apiKey="pk_test_yDDg994Tr2wo2xz2yopKIVT5">
                <AddCreditCard
                  addPaymentMethodCallback={this.handleAddPaymentMethod}
                  />
              </StripeProvider>
            </Modal.Body>
            {/* <Modal.Footer>
              <Button onClick={this.handleAddPaymentMethodHide}>Cancel</Button>
              <Button onClick={this.handleAddPaymentMethodSubmit}>Add</Button>
            </Modal.Footer> */}
          </Modal>
        </div>
      );
    }
  }

        {/* // <StripeProvider apiKey="pk_test_12345">
        //   <Elements>
        //   </Elements>
        // </StripeProvider> */}
  // const {
  //   CardElement,
  //   StripeProvider,
  //   Elements,
  //   injectStripe,
  // } = ReactStripeElements
  
  // class _CardForm extends React.Component {
  //   render() {
  //     return (
  //       <form onSubmit={() => this.props.stripe.createToken().then(payload => console.log(payload))}>
  //         <CardElement />
  //         <button>Pay</button>
  //       </form>
  //     )
  //   }
  // }
  // const CardForm = injectStripe(_CardForm)
  
  // class Checkout extends React.Component {
  //   render() {
  //     return (
  //       <div className="Checkout">
  //         <h1>Available Elements</h1>
  //         <Elements>
  //           <CardForm />
  //         </Elements>
  //       </div>
  //     )
  //   }
  // }
  
  // const App = () => {
  //   return (
  //     <StripeProvider apiKey="pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ">
  //       <Checkout />
  //     </StripeProvider>
  //   )
  // }
  // ReactDOM.render(<App />, document.querySelector('.App'))

//   validateForm() {
//     return this.state.content.length > 0;
//   }

// handleChange = event => {
//   this.setState({
//     [event.target.id]: event.target.value
//   });
// }

//   handleFileChange = event => {
//     this.file = event.target.files[0];
//   }

// 	handleSubmit = async event => {
// 	  event.preventDefault();

// 	  // if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
// 		// alert("Please pick a file smaller than 5MB");
// 		// return;
// 	  // }

// 	  this.setState({ isLoading: true });

// 	  try {
// 		await this.createReservation({
// 		  content: this.state.content
// 		});
// 		this.props.history.push("/reservations");
// 	  } catch (e) {
// 		alert(e);
// 		this.setState({ isLoading: false });
// 	  }
// 	}

// 	createReservation(reservation) {
// 	  return invokeApig({
// 		path: "/reservations",
// 		method: "POST",
// 		body: reservation
// 	  });
// 	}

//   render() {
//     return (
//       <StripeProvider apiKey="pk_test_12345">
//         <Elements>
//           <PaymentForm />
//         </Elements>
//       </StripeProvider>
//     );
//   }
// }