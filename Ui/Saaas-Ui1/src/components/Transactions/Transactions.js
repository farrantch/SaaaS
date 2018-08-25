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
import TransactionAccountTypeCollapse from "./TransactionAccountTypeCollapse";
import mappings from "../../data/mappings.json";

const accountTypeMappings = mappings['accountTypes'];


export default class Transactions extends Component {
    constructor(props) {
      super(props);
      var date = new Date();

      this.state = {
        isLoading: true,
        transactions: [],
        accounts: [],
        total: 0.00,
        yearMonth: date.getUTCFullYear()+ '-' + ('0' + (date.getUTCMonth()+1)).slice(-2)
      };

      this.updateYearMonth = this.updateYearMonth.bind(this);
    }

    calculateTotal(transactions) {
        let total = 0;
        transactions.forEach((transaction) => {
            total += Number(transaction.charge);
        });

        return this.formatTotal(total, 2);
    }

    formatTotal(num, fixed) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }

    async componentDidMount() {
        try {
            //var date = new Date();
            //const yearMonth = date.getUTCFullYear()+ '-' + ('0' + (date.getUTCMonth()+1)).slice(-2);
            const transactionResults = await this.listTransactions(this.state.yearMonth);
            const accountResults = await this.listAccounts();

            const totalResults = this.calculateTotal(transactionResults);
            //alert(JSON.stringify(results));
            this.setState({
                transactions: transactionResults,
                accounts: accountResults,
                total: totalResults 
            });
        } catch (e) {
                alert(e);
        }
        this.setState({
            isLoading: false
        });
    }

    async updateYearMonth(yearMonth) {
        const transactionResults = await this.listTransactions(yearMonth);
        const totalResults = this.calculateTotal(transactionResults);

        this.setState({
            total: totalResults,
            transactions: transactionResults,
            yearMonth: yearMonth
        });
    }

	// DONE
	listAccounts() {
		return invokeApig({ path: "/accounts" });
	}

    listTransactions(yearMonth) {
        yearMonth = yearMonth.replace('-','');
        return invokeApig({ path: `/transactions/yearmonth/${yearMonth}` });
    }

    renderTransactionAccountTypes(transactions, accounts) {
        let accountTypes = {};
        let accountTypesRendered = [];
        Array.from(transactions).forEach((transaction) => {
            // check if accountType has been added yet
            if (!(transaction.accountType in accountTypes)) {
                accountTypes[transaction.accountType] = [];
            }

            // add transaction to accountType list
            accountTypes[transaction.accountType].push(transaction);
        });

        //alert(JSON.stringify(accountTypes));
        for (var accountType in accountTypes) {
        //Array.from(accountTypes).forEach((accountType) => {
            let accountsFiltered = [];
            let accountTypeMapping = accountTypeMappings.find((accountTypeMapping) => accountTypeMapping.name === accountType);
            //alert(JSON.stringify(accountTypeMapping));

            // Filter accounts by type
            accounts.forEach((account) => {
                if (account.accountType == accountType) {
                    accountsFiltered.push(account);
                }
            });
            accountTypesRendered.push(
                <div key={accountType}>
                    {/* <Panel>
                        <Panel.Heading>
                            <Panel.Title toggle>{accountTypeMapping.alias}</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body collapsible>
                            <TransactionAccountTypeCollapse
                                accountTypeMapping={accountTypeMapping}
                                accounts={accountsFiltered}
                                accountType={accountType}
                                transactions={accountTypes[accountType]}
                                key={accountType}
                            />
                        </Panel.Body>
                    </Panel> */}
                    <TransactionAccountTypeCollapse
                        accountTypeMapping={accountTypeMapping}
                        accounts={accountsFiltered}
                        accountType={accountType}
                        transactions={accountTypes[accountType]}
                        key={accountType}
                    />
                </div>
            )
        }

        if (accountTypesRendered.length > 0) {
            return accountTypesRendered;
        }
        else
            return(
                <div>
                    No transactions to display.
                </div>
            )
        // Sort by accountType
            // Sort by Account
                // Sort By FeatureType
                    //Sort by region
    }  

    render() {
        //let accountTypes = this.renderTransactionsByAccountType(this.state.transactions);

        return (
            <div>
                {/* <PageHeader>Transaction Summary</PageHeader> */}
                <div >
                    <div style={{float: 'left' }}>
                        <div>
                            <h1>Transaction Summary</h1>
                        </div>
                        <div>
                            <h3> Monthly Total: &nbsp; ${this.state.total}</h3>
                        </div>
                    </div>
                    <div style={{float: 'right', marginTop: '60px'}}>
                        <Datetime
                        timeFormat={false}
                        value={ this.state.yearMonth }
                        dateFormat="YYYY-MM"
                        closeOnSelect
                        viewMode="years"
                        onChange={ yearMonth => {this.updateYearMonth(yearMonth.format('YYYY-MM'));}}
                        />
                    </div>
                    <div style={{float: 'right', marginTop: '67px'}}>
                        Year and Month:
                        &nbsp;
                    </div>
                    <div className="spacer" style={{clear: 'both'}}></div>
                </div>
                <hr/>
                {!this.state.isLoading && this.renderTransactionAccountTypes(this.state.transactions, this.state.accounts)}
            </div>
        )
    }
}