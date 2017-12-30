#! /usr/bin/env node

'use strict';

require('babel-polyfill');

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _cfDeploymentTrackerClient = require('cf-deployment-tracker-client');

var _cfDeploymentTrackerClient2 = _interopRequireDefault(_cfDeploymentTrackerClient);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV === 'production') {
  require('babel-register');
}
const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

_dotenv2.default.config({ silent: true });
_cfDeploymentTrackerClient2.default.track();

_app2.default.listen(port, () => {
  console.log('Server running on port: %d', port);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3d3dy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwicmVxdWlyZSIsInBvcnQiLCJQT1JUIiwiVkNBUF9BUFBfUE9SVCIsImNvbmZpZyIsInNpbGVudCIsInRyYWNrIiwibGlzdGVuIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6IjtBQUNBOztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSUEsUUFBUUMsR0FBUixDQUFZQyxRQUFaLEtBQXlCLFlBQTdCLEVBQTJDO0FBQ3pDQyxVQUFRLGdCQUFSO0FBQ0Q7QUFDRCxNQUFNQyxPQUFPSixRQUFRQyxHQUFSLENBQVlJLElBQVosSUFBb0JMLFFBQVFDLEdBQVIsQ0FBWUssYUFBaEMsSUFBaUQsSUFBOUQ7O0FBRUEsaUJBQU9DLE1BQVAsQ0FBYyxFQUFFQyxRQUFRLElBQVYsRUFBZDtBQUNBLG9DQUFrQkMsS0FBbEI7O0FBRUEsY0FBT0MsTUFBUCxDQUFjTixJQUFkLEVBQW9CLE1BQU07QUFDeEJPLFVBQVFDLEdBQVIsQ0FBWSw0QkFBWixFQUEwQ1IsSUFBMUM7QUFDRCxDQUZEIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcbmltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcbmltcG9ydCBkZXBsb3ltZW50VHJhY2tlciBmcm9tICdjZi1kZXBsb3ltZW50LXRyYWNrZXItY2xpZW50JztcbmltcG9ydCBzZXJ2ZXIgZnJvbSAnLi9hcHAnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICByZXF1aXJlKCdiYWJlbC1yZWdpc3RlcicpO1xufVxuY29uc3QgcG9ydCA9IHByb2Nlc3MuZW52LlBPUlQgfHwgcHJvY2Vzcy5lbnYuVkNBUF9BUFBfUE9SVCB8fCAzMDAwO1xuXG5kb3RlbnYuY29uZmlnKHsgc2lsZW50OiB0cnVlIH0pO1xuZGVwbG95bWVudFRyYWNrZXIudHJhY2soKTtcblxuc2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdTZXJ2ZXIgcnVubmluZyBvbiBwb3J0OiAlZCcsIHBvcnQpO1xufSk7XG4iXX0=