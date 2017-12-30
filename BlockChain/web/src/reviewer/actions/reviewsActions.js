'use strict';

import * as ReviewsActionTypes from './reviewsActionTypes';
import * as Api from '../api';

export function loadReviews() {
  return async dispatch => {
    let reviews;
    try {
      reviews = await Api.getReviews();
    } catch (error) {
      console.log(error); // Just logging the error nothing more.
    }
    if (reviews) {
      dispatch(loadReviewsSuccess(reviews));
    }
  };
}

function loadReviewsSuccess(reviews) {
  return {
    type: ReviewssActionTypes.LOAD_REVIEWS_SUCCESS,
    reviews
  };
}
