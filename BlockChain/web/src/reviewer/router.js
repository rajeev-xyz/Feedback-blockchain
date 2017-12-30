import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import App from './components/App';
import NotFoundPage from '../shared/NotFoundPage';

import SelfServiceApp from './components/self-service/App';
import MainPage from './components/self-service/MainPage';

import ReviewsPage from './components/self-service/ReviewsPage';
export default function router() {
  return (
    <Router basename='/insurance'>
      <App>
        <Switch>

          {/* Claim Self-Service */}
          <Route path='/self-service'>
            <SelfServiceApp>
              <Switch>
                <Route exact path='/self-service' component={MainPage} />
                <Route path='/self-service/main'
			component={MainPage} />
		<Route path='/self-service/reviews'
                  component={ReviewsPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </SelfServiceApp>
	</Route>
	</Switch>
      </App>
    </Router>
  );
}
