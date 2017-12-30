'use strict';

import fetch from 'isomorphic-fetch';

export function getReviews(status) {
  return fetch('/reviews/api/reviews', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ status })
  }).then(async res => {
    const claims = await res.json();
    return claims;
  });
}

export function fileReview(contractUuid, claim) {
  return fetch('/reviews/api/file-review', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user, contractUuid, claim })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Error occurred!");
    }
    return;
  });
}
