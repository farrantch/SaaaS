import React from 'react';
import {CardElement} from 'react-stripe-elements';

class CardSection extends React.Component {
  render() {
    return (
      <div>
        <label>
          Card details
        </label>
        <div>
          <CardElement style={{base: {fontSize: '18px'}}} />
        </div>
      </div>
    );
  }
};

export default CardSection;