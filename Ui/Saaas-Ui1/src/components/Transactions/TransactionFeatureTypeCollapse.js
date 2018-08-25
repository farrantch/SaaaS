import React, { Component } from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
    PanelGroup,
    Table
} from "react-bootstrap";
//import TransactionAccountCollapse from "./TransactionAccountCollapse"

export default class TransactionFeatureTypeCollapse extends Component {
	constructor(props) {
        super(props);
        
		this.state = {
            featureTotal: this.calculateTotal(this.props.transactions)
        };

        //this.props.updateTotalCallback(total);
    }

    calculateTotal(transactions) {
        let total = 0;
        transactions.forEach((transaction) => {
            total += Number(transaction.charge);
        });

        var round10 = require('round10').round10;
        return round10(total, -3); // 55.6
    }

    renderTransactionFeatureTypes(transactions) {
        const regions = {};
        const regionsRendered = [];

        Array.from(transactions).forEach((transaction) => {
            // check if account has been added yet
            if (!(transaction.region in regions)) {
                regions[transaction.region] = [];
            }

            // add account to account list
            regions[transaction.region].push(transaction);
        });
    
        for (var region in regions) {
            
            var round10 = require('round10').round10;

            //Calculate Cost
            let regionTotal = 0;
            regions[region].forEach((transaction) => {
                regionTotal += transaction.charge;
            });
            //featureTotal += regionTotal;

            regionsRendered.push(
                // <Panel>
                //     <Panel.Heading>
                //         <Panel.Title toggle>{region}</Panel.Title>
                //     </Panel.Heading>
                //     <Panel.Body collapsible>
                //         <TransactionAccountCollapse
                //             region={region}
                //             transactions={regions[region]}
                //             key={region}
                //         />
                //     </Panel.Body>
                // </Panel>
                <tr key={region}>
                    <td>{region}</td>
                    <td>{regions[region].length}</td>
                    <td>${round10(regionTotal, -3)}</td>
                </tr>
            )
        }

        return regionsRendered;
    }

    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading style={{overflow: 'hidden'}}>
                        <Panel.Title toggle style={{float: 'left' }}>{this.props.featureAlias}</Panel.Title>
                        <div style={{float: 'right'  }}>
                            ${this.state.featureTotal}
                        </div>
                    </Panel.Heading>
                    <Panel.Body collapsible>
                        <Table>
                            <thead>
                                <tr>
                                <th>Region</th>
                                <th>Invocation Count</th>
                                <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTransactionFeatureTypes(this.props.transactions)}
                            </tbody>
                        </Table>
                            {/* <TransactionFeatureTypeCollapse
                            featureType={featureType}
                            transactions={featureTypes[featureType]}
                            key={featureType}
                        /> */}
                    </Panel.Body>
                </Panel>
                <div>
                </div>
            </div>
        )
    }
}