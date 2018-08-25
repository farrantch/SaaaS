import React, { Component } from "react";
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel,
  ListGroup,
  ListGroupItem,
  PageHeader,
  Button,
  Modal,
  Glyphicon,
  Panel
} from "react-bootstrap";
import LoaderButton from "../../components/LoaderButton";
import "./PaymentMethods.css";
import config from "../../config.json";
import Phone from "react-phone-number-input";
import "react-phone-number-input/rrui.css";
import "react-phone-number-input/style.css";
import "react-datetime/css/react-datetime.css";
import Datetime from "react-datetime";
import Moment from 'react-moment';
import { getCognitoUserAttributes, authUser, getCurrentUser } from '../../libs/awsLib';
import { invokeApig } from "../../libs/awsLib";
import { StripeProvider } from 'react-stripe-elements';
import AddCreditCard  from "../../components/CreditCard/AddCreditCard";

export default class PaymentMethods extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        showAddPaymentMethodModal: false,
        isRefreshing: false,
        isEditing: false,
        user: null
      };

      this.handleAddPaymentMethodHide = this.handleAddPaymentMethodHide.bind(this);
      this.handleAddPaymentMethodShow = this.handleAddPaymentMethodShow.bind(this);
      this.handleAddPaymentMethod = this.handleAddPaymentMethod.bind(this);
    }
    
    async componentDidMount() {
        try {
            const results = await this.getUser();
            this.setState({ user: results[0] });
        } catch (e) {
                alert(e);
        }
        this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }
  
    getUser() {
        return invokeApig({ path: `/users/${this.props.match.params.id}` });
    }

    async handleAddPaymentMethod(token) {
      this.setState({
        isRefreshing: true
      })
      await this.addPaymentMethod({
        token: token,
      });
  
      this.manualUpdate();
    }

    async manualUpdate() {
      try {
          const results = await this.getUser();
          this.setState({ user: results[0] });
      } catch (e) {
              alert(e);
      }
      this.setState({
          isLoading: false,
          showAddPaymentMethodModal: false,
          isRefreshing: false
      });
    }
    
    addPaymentMethod(paymentMethod) {
      return invokeApig({
        path: "/paymentmethods",
        method: "POST",
        body: paymentMethod
      });
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
  
    renderPaymentMethodsList(user) {
      // [{}].concat(paymentMethods).map(
      //   (paymentMethod, i) =>
          //i !== 0
      let paymentMethodsList = [];
      //if (this.state.user) {
        if (user.stripeCustomer != null) {
          Array.from(user.stripeCustomer.sources.data).forEach((card) => {
            paymentMethodsList.push(
              <Panel
                key={card.id}
                //href={`/paymentmethods/${paymentMethod.paymentMethodId}`}
                //onClick={this.handlePaymentMethodClick}
                >
                <Panel.Heading>
                  {card.brand.trim().split("\n")[0]}
                </Panel.Heading>
                <Panel.Body>
                  <div>
                    <span style={{width:'150px', display:'inline-block'}}>
                      Name on card: &nbsp;
                    </span>
                    <span>
                      {card.name}
                    </span>
                  </div>
                  <div>
                    <span style={{width:'150px', display:'inline-block'}}>
                      Last 4: &nbsp;
                    </span>
                    <span>
                      {card.last4}
                    </span>
                  </div>  
                  <div>
                    <span style={{width:'150px', display:'inline-block'}}>
                      Expiration: &nbsp; 
                    </span>
                    <span>
                      {card.exp_month + "/" + card.exp_year}
                    </span>
                  </div>
                </Panel.Body>
              </Panel>
            )
          });
        }
      //}
      if (paymentMethodsList.length < 1) {
        paymentMethodsList.push(
          <div key="none">
            No payment methods have been added.
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
                  <PageHeader>Payment Methods</PageHeader>
                </div>
                <div style={{float: 'right', marginTop: '60px'}}>
                  <Button
                  bsStyle="primary"
                  bsSize="small"
                  onClick={ () => this.handleAddPaymentMethodShow()}
                  >
                      
                    <Glyphicon glyph="glyphicon glyphicon-plus"/> Add Payment Method
                  </Button>
                </div>
              </div>
              <div>
                <ListGroup>
                  {!this.state.isLoading && this.renderPaymentMethodsList(this.state.user)}
                </ListGroup>
              </div>
            </div>
          <Modal show={this.state.showAddPaymentMethodModal} onHide={this.handleAddPaymentMethodHide}>
            <Modal.Header closeButton>
              <Modal.Title>Add Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <StripeProvider apiKey={config.stripe.PUBLIC_KEY}>
                <AddCreditCard
                  addPaymentMethodCallback={this.handleAddPaymentMethod}
                  isRefreshing={this.state.isRefreshing}
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