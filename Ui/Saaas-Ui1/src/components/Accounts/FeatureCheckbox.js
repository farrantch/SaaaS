import React from "react";
import { invokeApig } from "../../libs/awsLib";
import {
    Panel,
	PanelGroup,
	Checkbox,
	Button,
	Modal,
	ListGroup,
	ListGroupItem
} from "react-bootstrap";

export class FeatureCheckbox extends React.Component {
	constructor(props) {
	  super(props);
	  //alert(JSON.stringify(props));
	  this.state = {
			//isChecked: this.props.checked
	  };
	  this.handleOnClick = this.handleOnClick.bind(this);
	}

	handleOnClick() {
		if (this.props.checked) {
			this.props.deleteFeatureCallback(this.props.account, this.props.region, this.props.feature);
		}

		else {
			this.props.addFeatureCallback(this.props.account, this.props.region, this.props.feature);
		}
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({ isChecked: nextProps.checked });  
	// }
  
	// handleInputChange(event) {
	// //   const target = event.target;
	// //   const value = target.type === 'checkbox' ? target.checked: target.value;
	// //   const name = target.name
  
	//   // this.setState({
	// 	// isChecked: event.target.checked
	//   // });
	// }

	render() {
		return (
				<div>
				<span>
				<input
					type="checkbox"
					readOnly
					checked={this.props.checked}
					onClick={ () => this.handleOnClick()}
				/>
				</span>
					&nbsp; {this.props.feature.aliasAction}
				</div> 	
		)
	}
}
