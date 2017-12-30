'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import { fileReview } from '../../api';

class ReviewsPage extends React.Component {

  static get propTypes() {
    return {
      user: PropTypes.object,
      history: PropTypes.object.isRequired,
      match: PropTypes.shape({
        params: PropTypes.shape({
          //contractUuid: PropTypes.string.isRequired
        })
      }).isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = { loading: false, isHappy: false, description: '' };

    this.submit = this.submit.bind(this);
    this.setHappy = this.setHappy.bind(this);
    this.setDescription = this.setDescription.bind(this);
  }

  submit() {
    const { isHappy, description } = this.state;
    const { history } = this.props;
    this.setState({ loading: true });
    fileReview(this.props.user,
      //this.props.match.params.contractUuid, 
	{ isHappy, description })
      .then(() => {
        history.push('/self-service/reviews');
        this.setState({ loading: false });
      }).catch(() => {
        this.setState({ loading: false });
        alert('Error occurred!');
      });
  }

  setHappy(event) {
    this.setState({ isHappy: !this.refs.happyField.checked });
  }

  setDescription({ target }) {
    this.setState({ description: target.value });
  }

  render() {
    const { loading, isHappy, description } = this.state;
    const { user } = this.props;

    return (
      <Loading hidden={!loading}>
        <div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <h3 className='ibm-h3'><FormattedMessage id='File a Review' /></h3>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <div className='ibm-column-form'>
                <p className='ibm-form-elem-grp'>
                  <label>
                    <FormattedMessage className='ibm-field-label' id='Happy' />:
                </label>
                  <span className='ibm-input-group'>
                    <input type='checkbox' ref='happyField'
                      className='ibm-styled-checkbox'
                      checked={isHappy} onChange={this.setHappy} />
                    <label className='ibm-field-label' htmlFor='happyField'
                      onClick={this.setHappy} />
                  </span>
                </p>
                <p>
                  <label><FormattedMessage id='Description' />:</label>
                  <span>
                    <textarea value={description}
                      onChange={this.setDescription} />
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
              <button type='button' className='ibm-btn-pri ibm-btn-blue-50'
                onClick={this.submit}><FormattedMessage id='Submit' /></button>
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user
  };
}

export default withRouter(connect(mapStateToProps)(ReviewsPage));
