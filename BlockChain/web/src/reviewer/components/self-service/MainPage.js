'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  FormattedMessage, FormattedDate,
  injectIntl, intlShape
} from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Link, Redirect } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import * as reviewsActions from '../../actions/reviewsActions';

class Mainpage extends React.Component{
	static get propTypes() {
    		return {
      			intl: intlShape.isRequired,
      			//user: PropTypes.object,
      			reviews: PropTypes.array,
      			reviewsActions: PropTypes.object.isRequired
    		};
	}
	constructor(props) {
    		super(props);

		this.state = { loading: true };
		props.reviewsActions.loadReviews();
	}
	componentWillReceiveProps(nextProps) {
    		if (Array.isArray(nextProps.reviews)) {
      			this.setState({ loading: false });
    		}
	}
	render() {
		const { loading } = this.state;
		const { reviews, intl} = this.props;
		function reviewButtons(contract) {
      			let fileClaim =
        			(			
          			<p className='ibm-ind-link'>
            			<Link className='ibm-forward-link'
              			to={`/self-service/review/${contract.uuid}`}>
              			<FormattedMessage id='File a New Review' />
            			</Link>
          			</p>
        		);

      			return (
        			<div>
          			{fileReview}
          			<p className='ibm-ind-link'>
            			<Link className='ibm-forward-link'
              			to={`/self-service/contract/${contract.uuid}/claims`}>
              			<FormattedMessage id='View Claims' />
              			({(contract.claims || []).length})
              			</Link>
          			</p>
        			</div>
			);
		}
		const cards = Array.isArray(reviews) ? reviews.map(
      			(contract, index) => (
        			<div key={index} className='ibm-col-5-1 ibm-col-medium-6-2'>
          			<div className='ibm-card ibm-border-gray-50'>
            			<div className='ibm-card__content'>
				<h4 className='ibm-bold ibm-h4'>{review.description}</h4>
				<br />
              			{claimButtons(contract)}
            			</div>
          			</div>
        			</div>
			)) : null;
		
		return (
      			<Loading hidden={!loading}
        		text={intl.formatMessage({ id: 'Loading Reviews...' })}>
        		<div className='ibm-columns' style={{ minHeight: '6em' }}>
          		<div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            		<h3 className='ibm-h3'><FormattedMessage id='Your Contracts' /></h3>
          		</div>
          		<div className='ibm-columns ibm-cards' data-widget='masonry'
            		data-items='.ibm-col-5-1'>
            		{cards}
          		</div>
        		</div>
      			</Loading>
    			);
  		}
	}

function mapStateToProps(state, ownProps) {
  return {
    //user: state.userMgmt.user,
    //contracts: state.contracts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    reviewsActions: bindActionCreators(reviewsActions, dispatch)
  };
}

export default withRouter(connect(
mapStateToProps, mapDispatchToProps)(injectIntl(MainPage)));
