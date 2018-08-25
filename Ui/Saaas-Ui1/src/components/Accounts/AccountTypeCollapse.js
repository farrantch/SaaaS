import React from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
	PanelGroup,
	Button,
	Glyphicon
} from "react-bootstrap";
import { AccountCollapse } from "./AccountCollapse"


export class AccountTypeCollapse extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}
    
    render() {
		const accountsPanelGroup = [];
		this.props.accounts.forEach((account) => {
			// let regionListMappings = this.props.accountTypeMappings.find((region) => region.name === account
			// let regionFeaturesMappings = 
			// var filteredFeatures = Array.from(this.props.features).filter((feature) => {
			// 	return feature.accountId===account.accountId
			// });
			accountsPanelGroup.push(
				<Panel
					accordion="true"
					key={account.accountId}
				>
					<Panel.Heading style={{overflow: 'hidden'}}>
						<Panel.Title toggle style={{float: 'left'  }}>{account.accountName} - {account.accountId}</Panel.Title>
						<div style={{float: 'right'  }}>
							<Button
								style={{backgroundColor: '#DDD'}}
								bsSize="xsmall"
								onClick={ () => this.props.deleteAccountCallback(account)}
							>
								<Glyphicon glyph="glyphicon glyphicon-remove"/>
								&nbsp;
								Delete Account
							</Button>
						</div>
					</Panel.Heading>
					<Panel.Body collapsible>
						<AccountCollapse
							account={account}
							//features={filteredFeatures}
							deleteRegionCallback={this.props.deleteRegionCallback}
							addRegionCallback={this.props.addRegionCallback}
							updateAccountCallback={this.props.updateAccount}
							deleteAccountCallback={this.props.deleteAccountCallback}
							//updateFeatureCallback={this.props.updateFeatureCallback}
							addFeatureCallback={this.props.addFeatureCallback}
							deleteFeatureCallback={this.props.deleteFeatureCallback}
							generateIamPolicyCallback={this.props.generateIamPolicyCallback}
							mapAccountType={this.props.mapAccountType}
							/>
					</Panel.Body>
				</Panel>
			)
		})

        return (
			<div>
				{accountsPanelGroup}
			</div>
        );
    }

}