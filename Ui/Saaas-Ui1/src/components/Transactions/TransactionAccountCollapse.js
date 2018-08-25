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
  Panel
} from "react-bootstrap";
import "./Transactions.css";
import config from "../../config.json";
import Phone from "react-phone-number-input";
import Datetime from "react-datetime";
import Moment from 'react-moment';
import { getCognitoUserAttributes, authUser, getCurrentUser } from '../../libs/awsLib';
import { invokeApig } from "../../libs/awsLib";
import { StripeProvider } from 'react-stripe-elements';
import TransactionFeatureTypeCollapse from "./TransactionFeatureTypeCollapse";

export default class TransactionAccountCollapse extends Component {
	constructor(props) {
		super(props);

		this.state = {
            total: this.calculateTotal(this.props.transactions)
        };
    }

    calculateTotal(transactions) {
        let total = 0;
        transactions.forEach((transaction) => {
            total += Number(transaction.charge);
        });

        var round10 = require('round10').round10;
        return round10(total, -3); // 55.6
    }

    renderTransactionFeatureTypeCollapse(transactions) {
        const featureTypes = {};
        const featureTypesRendered = [];

        Array.from(transactions).forEach((transaction) => {
            // check if account has been added yet
            if (!(transaction.featureType in featureTypes)) {
                featureTypes[transaction.featureType] = [];
            }

            // add account to account list
            featureTypes[transaction.featureType].push(transaction);
        });

        for (var featureType in featureTypes) {
            //alert(featureType);
            let featureAlias = this.props.accountTypeMapping.regionFeatures.find((regionFeature) => regionFeature.name == featureType).aliasFull;
            featureTypesRendered.push(
                <div key={featureType}>
                {/* <Panel>
                    <Panel.Heading style={{overflow: 'hidden'}}>
                        <Panel.Title toggle style={{float: 'left' }}>{featureAlias}</Panel.Title>
                        <div style={{float: 'right'  }}>
                            Total: ${}
                        </div>
                    </Panel.Heading>
                    <Panel.Body collapsible> */}
                        <TransactionFeatureTypeCollapse
                            featureAlias={featureAlias}
                            featureType={featureType}
                            transactions={featureTypes[featureType]}
                            key={featureType}
                            updateTotalCallback={this.updateTotal}
                        />
                    {/* </Panel.Body>
                </Panel> */}
                </div>
            )
        }

        return featureTypesRendered;
    }

    render() {
        return(
            <div>
                <Panel>
                    <Panel.Heading style={{overflow: 'hidden'}}>
                        <Panel.Title toggle style={{float: 'left' }}>{this.props.accountName} - {this.props.account}</Panel.Title>
                        <div style={{float: 'right'  }}>
                            ${this.state.total}
                        </div>
                    </Panel.Heading>
                    <Panel.Body collapsible>
                        {/* <TransactionAccountCollapse
                            accountTypeMapping={this.props.accountTypeMapping}
                            account={account}
                            transactions={accounts[account]}
                            key={account}
                        /> */}
                        {this.renderTransactionFeatureTypeCollapse(this.props.transactions)}
                    </Panel.Body>
                </Panel>
            </div>
        );
    }
}