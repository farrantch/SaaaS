import React, { Component } from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
    PanelGroup,
    Table
} from "react-bootstrap";


export default class TransactionRegionCollapse extends Component {
	constructor(props) {
		super(props);

		this.state = {
            //accountTotal: 0
        };
    }

    renderRegions() {
        const feature
    }

    render() {
        return(
            <div>
                <Table>
                    <thead>
                        <tr>
                        <th>Region</th>
                        <th>Invocation Count</th>
                        <th>$ / invocation</th>
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
            </div>
        );
    }
}