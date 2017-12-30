'use strict';

import * as ReviewProcessingActionType from './reviewProcessingActionTypes';
import * as Api from '../api';

export function loadReviews() {
  return async dispatch => {
    let reviews;
    try {
      reviews = await Api.getClaims('N'); // Load only (N)ew (unprocessed) claims
      //const confirmedTheftClaims = await Api.getClaims('P');
      //reviews = reviewss.concat(confirmedTheftClaims);
    } catch (e) {
      console.log(e);
    }
    if (Array.isArray(claims)) {
      dispatch(loadReviewsSuccess(reviews));
    }
  };
}

function loadReviewsSuccess(reviews) {
  return {
    type: ReviewProcessingActionType.LOAD_REVIEWS_SUCCESS,
    reviews
  };
}

