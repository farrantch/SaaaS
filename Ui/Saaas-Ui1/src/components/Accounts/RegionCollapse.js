import React from "react";
import { invokeApig } from "../../libs/awsLib";
import {
	Button
} from "react-bootstrap";
import { FeatureCheckbox } from "./FeatureCheckbox";
import { FeatureGroupPanel } from "./FeatureGroupPanel";
//import RdsFeatures from "./FeaturePanels/RdsFeatures"

export class RegionCollapse extends React.Component {
	constructor(props) {
		super(props);

		// let arr = [];
		// for (let feature of this.props.features) {
		// 	arr.push(feature.name);
		// }

		this.state = {
			//activeKey: '1'
			//showModal: false
		};
	}

	renderFeatures() {
		//let featureList = [];
		let ec2Features = [];
		let mapEc2FeatureGroup = [];
		let rdsFeatures = [];
		let mapRdsFeatureGroup = [];

		// // Loop through regionFeatures
		// for (let regionFeature of this.props.regionFeaturesMapping) {
		// 	// If regionFeature is enabled

		// Filter mapRegionFeatures by group
		if (this.props.mapRegionFeatures) {
			mapEc2FeatureGroup = this.props.mapRegionFeatures.filter((feature) => feature.group === "ec2")
			mapRdsFeatureGroup = this.props.mapRegionFeatures.filter((feature) => feature.group === "rds")
		}
		
		// Filter featuresList by group
		if (this.props.region) {
			ec2Features = this.props.region.features.filter((feature) => feature.group === "ec2")
			rdsFeatures = this.props.region.features.filter((feature) => feature.group === "rds")
		}

		// 	let featureEnabled = false;
		// 	if (this.props.region.features) {
		// 		featureEnabled = this.props.region.features.some((feature) => regionFeature.name === feature.name);
		// 	}

		// 	if (featureEnabled) {
		// 		featureList.push(
		// 			<div key={regionFeature.name + ".enabled"}>
		// 				<FeatureCheckbox
		// 					feature={regionFeature}
		// 					checked="true"
		// 					region={this.props.region}
		// 					account={this.props.account}
		// 					updateFeatureCallback={this.props.updateFeatureCallback}
		// 					addFeatureCallback={this.props.addFeatureCallback}
		// 					deleteFeatureCallback={this.props.deleteFeatureCallback}
		// 				/>
		// 			</div>
		// 		)
		// 	}
		// 	else {
		// 		featureList.push(
		// 			<div key={regionFeature.name + ".disabled"}>
		// 				<FeatureCheckbox
		// 					feature={regionFeature}
		// 					checked=""
		// 					region={this.props.region}
		// 					account={this.props.account}
		// 					updateFeatureCallback={this.props.updateFeatureCallback}
		// 					addFeatureCallback={this.props.addFeatureCallback}
		// 					deleteFeatureCallback={this.props.deleteFeatureCallback}
		// 				/>
		// 			</div>
		// 		)
		// 	}
		// }

		//return featureList;
		return(
			<div style={{overflow: 'hidden'}}>
				<div style={{float: 'left'  }}>
					<FeatureGroupPanel
						featureGroup="ec2"
						featureGroupAlias="EC2"
						featureList={ec2Features}
						addFeatureCallback={this.props.addFeatureCallback}
						deleteFeatureCallback={this.props.deleteFeatureCallback}
						mapFeatureGroups={mapEc2FeatureGroup}
						region={this.props.region}
						account={this.props.account}
					/>
				</div>
				<div style={{float: 'left'  }}>&nbsp;</div>
				<div style={{float: 'left'  }}>
					<FeatureGroupPanel
						featureGroup="rds"
						featureGroupAlias="RDS"
						featureList={rdsFeatures}
						addFeatureCallback={this.props.addFeatureCallback}
						deleteFeatureCallback={this.props.deleteFeatureCallback}
						mapFeatureGroups={mapRdsFeatureGroup}
						region={this.props.region}
						account={this.props.account}
					/>
				</div>
			</div>
		);
	}

    render() {
		const featureList = this.renderFeatures()
        return (
			<div>
				<div>
					{featureList}
				</div>
			</div>
        );
    }
}