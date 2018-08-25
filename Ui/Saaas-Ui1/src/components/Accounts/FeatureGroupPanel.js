import React from "react";
import {
    Panel,
	PanelGroup
} from "react-bootstrap";
import { FeatureCheckbox } from "./FeatureCheckbox";
//import { AccountCollapse } from "./AccountCollapse"

export class FeatureGroupPanel extends React.Component {
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
		let features = [];

		// Loop through regionFeatures
		if (this.props.mapFeatureGroups) {
			for (let groupFeature of this.props.mapFeatureGroups) {
				// If regionFeature is enabled
				
				let featureEnabled = false;
				//alert(JSON.stringify(this.props.accuont));
				if (this.props.featureList) {
					featureEnabled = this.props.featureList.some((feature) => groupFeature.name === feature.name);
				}

				if (featureEnabled) {
					features.push(
						<div key={groupFeature.name + ".enabled"}>
							<FeatureCheckbox
								feature={groupFeature}
								group={this.props.group}
								checked="true"
								region={this.props.region}
								account={this.props.account}
								updateFeatureCallback={this.props.updateFeatureCallback}
								addFeatureCallback={this.props.addFeatureCallback}
								deleteFeatureCallback={this.props.deleteFeatureCallback}
							/>
						</div>
					)
				}
				else {
					features.push(
						<div key={groupFeature.name + ".disabled"}>
							<FeatureCheckbox
								feature={groupFeature}
								group={this.props.group}
								checked=""
								region={this.props.region}
								account={this.props.account}
								updateFeatureCallback={this.props.updateFeatureCallback}
								addFeatureCallback={this.props.addFeatureCallback}
								deleteFeatureCallback={this.props.deleteFeatureCallback}
							/>
						</div>
					)
				}
			}
		}

		return features;
		
	}

    render() {
		const featureList = this.renderFeatures()
        return (
			<div>
				<Panel>
					<Panel.Heading>
						{this.props.featureGroupAlias}
					</Panel.Heading>
					<Panel.Body>
						{featureList}
					</Panel.Body>
				</Panel>
			</div>
        );
    }
}