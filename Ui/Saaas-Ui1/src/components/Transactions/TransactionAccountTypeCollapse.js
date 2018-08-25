import React, { Component } from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
    PanelGroup,
    Button
} from "react-bootstrap";
import TransactionAccountCollapse from "./TransactionAccountCollapse"

export default class TransactionAccountTypeCollapse extends Component {
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

    // formatTotal(num, fixed) {
    //     var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    //     return num.toString().match(re)[0];
    // }

    renderTransactionAccounts(transactions) {
        const accounts = {};
        const accountsRendered = [];

        Array.from(transactions).forEach((transaction) => {
            // check if account has been added yet
            if (!(transaction.accountId in accounts)) {
                accounts[transaction.accountId] = [];
            }

            // add account to account list
            accounts[transaction.accountId].push(transaction);
        });

        for (var account in accounts) {
            let accountName = "DELETED";
            let accountNameLookup = this.props.accounts.find((a) => a.accountId == account);
            if (accountNameLookup) {
                accountName = accountNameLookup.accountName;
            }
            accountsRendered.push(
                <div key={account}>
                    {/* <Panel>
                    <Panel.Heading>
                            <Panel.Title toggle>{accountName} - {account}</Panel.Title>
                        </Panel.Heading>
                    <Panel.Body collapsible> */}
                        <TransactionAccountCollapse
                            accountName = {accountName}
                            accountTypeMapping={this.props.accountTypeMapping}
                            account={account}
                            transactions={accounts[account]}
                            key={account}
                        />
                    {/* </Panel.Body>
                </Panel> */}
                </div>
            )
        }

        return accountsRendered;
    }
    
    render() {
        return(
            <div>
                <Panel>
                    <Panel.Heading style={{overflow: 'hidden'}}>
                        <Panel.Title toggle style={{float: 'left' }}>{this.props.accountTypeMapping.alias}</Panel.Title>
                        <div style={{float: 'right'  }}>
                            ${this.state.total}
                            </div>
                        </Panel.Heading>
                    <Panel.Body collapsible>
                        {/* <TransactionAccountTypeCollapse
                            accountTypeMapping={accountTypeMapping}
                            accounts={accountsFiltered}
                            accountType={accountType}
                            transactions={accountTypes[accountType]}
                            key={accountType}
                        /> */}
                        {this.renderTransactionAccounts(this.props.transactions)}
                    </Panel.Body>
                </Panel>
            </div>
        );
    }
    
}