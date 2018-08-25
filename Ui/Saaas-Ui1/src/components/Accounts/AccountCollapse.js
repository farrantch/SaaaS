import React from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
	PanelGroup,
	Button,
	Glyphicon
} from "react-bootstrap";
import { RegionCollapse } from "./RegionCollapse";
import Download from '@axetroy/react-download';
import iamPolicyTemplate from "../../data/iamPolicyTemplate";
import cloudformationTemplate from "../../data/cloudformationTemplate";

export class AccountCollapse extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
	}
	
	generateIamPolicy(account) {
		let iamPolicy = JSON.parse(JSON.stringify(iamPolicyTemplate));
		let mapFeatures = [];
		//let mapAccountType = accountTypeMappings.filter((accountType) => accountType.name == account.accountType)[0];
		//let mapAccountType = this.props.mapAccountType;
		
		// For each region
		account.regions.forEach((region) => {
			// If not global, use regionFeatures
			if (region.name != "global") {
				mapFeatures =  this.props.mapAccountType.regionFeatures;
			}
			// Else, use globalFeatures
			else {
				mapFeatures =  this.props.mapAccountType.globalFeatures;
			}

			// For each user feature added within the region
			region.features.forEach((feature) => {

				// Find mapped Feature policy
				let mapFeature = mapFeatures.filter((mapFeature) => mapFeature.name == feature.name)[0];

				mapFeature.policies.forEach((policy) => {
					// Has this feature already been added to the iamPolicy Statement? (yes if feature also in a different region)
					let index = iamPolicy.Statement.findIndex((p) => {
						return p.Sid === policy.Sid;
					});

					// If so, just append the resource to the resource array
					if ( index != -1) {
						iamPolicy.Statement[index].Resource.push(
							JSON.parse(
								JSON.stringify(
									policy.Resource[0]
								).replace(
									'<region>', region.name
								).replace(
									'<account>', account.accountId
								)
							)
						);
					}
	
					// If not, add policy to iamPolicy array
					else {
						iamPolicy.Statement.push(
							JSON.parse(
								JSON.stringify(
									policy
								).replace(
									'<region>', region.name
								).replace(
									'<account>', account.accountId
								)
							)
						);
					}
				});
			});
		});
		return iamPolicy;
	}

	generateCloudFormationTemplate(account) {
		let iamPolicy = this.generateIamPolicy(account);
		let cfTemplate = JSON.parse(JSON.stringify(cloudformationTemplate));
		cfTemplate.Resources.IamManagedPolicy.Properties.PolicyDocument = iamPolicy;
		//JSON.stringify(iamPolicy));
		return JSON.stringify(cfTemplate, null, 4);
	}

    render() {
		const regionsPanelGroup = [];
		if (this.props.account.regions) {
			this.props.account.regions.forEach((region) => {
				//let regionListMappings = this.props.accountTypeMapping.regionList.find((region) => region.name === this.props
				//let regionFeaturesMappings = 
				// var filteredFeatures = Array.from(this.props.features).filter((feature) => {return feature.region===region.name});
				regionsPanelGroup.push(
					<Panel
					accordion="true"
					key={region.name}
					onSelect={this.handleSelect} >
						<Panel.Heading style={{overflow: 'hidden'}}>
							<Panel.Title toggle style={{float: 'left'  }}>{region.name}</Panel.Title>
							<div style={{float: 'right'  }}>
								<Button style={{backgroundColor: '#DDD'}} bsSize="xsmall" onClick={ () => this.props.deleteRegionCallback(this.props.account, region)}>
									<Glyphicon glyph="glyphicon glyphicon-remove"/>
									&nbsp;
									Remove Region
								</Button>
							</div>
						</Panel.Heading>
						<Panel.Body collapsible>
							<RegionCollapse
								region={region}
								account={this.props.account}
								deleteRegionCallback={this.props.deleteRegionCallback}
								updateAccountCallback={this.props.updateAccount}
								//updateFeatureCallback={this.props.updateFeatureCallback}
								addFeatureCallback={this.props.addFeatureCallback}
								deleteFeatureCallback={this.props.deleteFeatureCallback}
								mapRegionFeatures={this.props.mapAccountType.regionFeatures}
							/>
						</Panel.Body>
					</Panel>
				)
			})
		}
        return (
			<div>
				<div>
					{regionsPanelGroup}
				</div>
				<div style={{overflow: 'hidden'}}>
					<div style={{float: 'left'  }}>
						<Button
							bsStyle="primary"
							bsSize="small"
							onClick={ () => this.props.addRegionCallback(this.props.account)}
						>
							<Glyphicon glyph="glyphicon glyphicon-plus"/>
							&nbsp;
							Add Region
						</Button>
					</div>
					<div style={{float: 'left'  }}>
						&nbsp;
					</div>
					{/* <div>
						<Button
							bsStyle="success"
							bsSize="small"
							onClick={ () => this.props.generateIamPolicyCallback(this.props.account)}
						>
							Generate Acccount IAM Policy
						</Button>
					</div> */}
					<div style={{float: 'left'  }}>
						<Download file="saaas-cloud-cloudformation-assume-role.json" content={this.generateCloudFormationTemplate(this.props.account)}>
							<Button
								bsStyle="success"
								bsSize="small"
							>
								<Glyphicon glyph="glyphicon glyphicon-download-alt"/>
								&nbsp;
								Download CloudFormation Template
							</Button>
						</Download>
					</div>
				</div>
			</div>
        );
    }
}