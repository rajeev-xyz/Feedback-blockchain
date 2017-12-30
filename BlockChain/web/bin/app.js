'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('http');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _express3 = require('./config/express');

var _express4 = _interopRequireDefault(_express3);

var _reviewer = require('./routers/reviewer.router');

var _reviewer2 = _interopRequireDefault(_reviewer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REVIEWER_ROOT_URL = '/reviewer';
//import agencyRouter, { wsConfig as agencyWsConfig }
//from './routers/agency.router';

const AGENCY_ROOT_URL = '/agency';

const app = (0, _express2.default)();
const httpServer = new _http.Server(app);

// Setup web sockets
const io = (0, _socket2.default)(httpServer);
//agencyWsConfig(io.of(AGENCY_ROOT_URL));
(0, _reviewer.wsConfig)(io.of(REVIEWER_ROOT_URL));

(0, _express4.default)(app);

app.get('/', (req, res) => {
  res.render('home', { homeActive: true });
});

// Setup routing
//app.use(AGENCY_ROOT_URL, agencyRouter);
app.use(REVIEWER_ROOT_URL, _reviewer2.default);

exports.default = httpServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3d3dy9hcHAuanMiXSwibmFtZXMiOlsiUkVWSUVXRVJfUk9PVF9VUkwiLCJBR0VOQ1lfUk9PVF9VUkwiLCJhcHAiLCJodHRwU2VydmVyIiwiaW8iLCJvZiIsImdldCIsInJlcSIsInJlcyIsInJlbmRlciIsImhvbWVBY3RpdmUiLCJ1c2UiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQTs7Ozs7O0FBR0EsTUFBTUEsb0JBQW9CLFdBQTFCO0FBTEE7QUFDRTs7QUFLRixNQUFNQyxrQkFBa0IsU0FBeEI7O0FBRUEsTUFBTUMsTUFBTSx3QkFBWjtBQUNBLE1BQU1DLGFBQWEsaUJBQVdELEdBQVgsQ0FBbkI7O0FBRUE7QUFDQSxNQUFNRSxLQUFLLHNCQUFTRCxVQUFULENBQVg7QUFDQTtBQUNBLHdCQUFpQkMsR0FBR0MsRUFBSCxDQUFNTCxpQkFBTixDQUFqQjs7QUFFQSx1QkFBaUJFLEdBQWpCOztBQUVBQSxJQUFJSSxHQUFKLENBQVEsR0FBUixFQUFhLENBQUNDLEdBQUQsRUFBTUMsR0FBTixLQUFjO0FBQ3pCQSxNQUFJQyxNQUFKLENBQVcsTUFBWCxFQUFtQixFQUFFQyxZQUFZLElBQWQsRUFBbkI7QUFDRCxDQUZEOztBQUlBO0FBQ0E7QUFDQVIsSUFBSVMsR0FBSixDQUFRWCxpQkFBUjs7a0JBRWVHLFUiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tICdodHRwJztcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHNvY2tldElvIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgY29uZmlndXJlRXhwcmVzcyBmcm9tICcuL2NvbmZpZy9leHByZXNzJztcbi8vaW1wb3J0IGFnZW5jeVJvdXRlciwgeyB3c0NvbmZpZyBhcyBhZ2VuY3lXc0NvbmZpZyB9XG4gIC8vZnJvbSAnLi9yb3V0ZXJzL2FnZW5jeS5yb3V0ZXInO1xuaW1wb3J0IHJldmlld2VyUm91dGVyLCB7IHdzQ29uZmlnIGFzIHJldmlld2VyV3NDb25maWcgfVxuICBmcm9tICcuL3JvdXRlcnMvcmV2aWV3ZXIucm91dGVyJztcblxuY29uc3QgUkVWSUVXRVJfUk9PVF9VUkwgPSAnL3Jldmlld2VyJztcbmNvbnN0IEFHRU5DWV9ST09UX1VSTCA9ICcvYWdlbmN5JztcblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuY29uc3QgaHR0cFNlcnZlciA9IG5ldyBTZXJ2ZXIoYXBwKTtcblxuLy8gU2V0dXAgd2ViIHNvY2tldHNcbmNvbnN0IGlvID0gc29ja2V0SW8oaHR0cFNlcnZlcik7XG4vL2FnZW5jeVdzQ29uZmlnKGlvLm9mKEFHRU5DWV9ST09UX1VSTCkpO1xucmV2aWV3ZXJXc0NvbmZpZyhpby5vZihSRVZJRVdFUl9ST09UX1VSTCkpO1xuXG5jb25maWd1cmVFeHByZXNzKGFwcCk7XG5cbmFwcC5nZXQoJy8nLCAocmVxLCByZXMpID0+IHtcbiAgcmVzLnJlbmRlcignaG9tZScsIHsgaG9tZUFjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4vLyBTZXR1cCByb3V0aW5nXG4vL2FwcC51c2UoQUdFTkNZX1JPT1RfVVJMLCBhZ2VuY3lSb3V0ZXIpO1xuYXBwLnVzZShSRVZJRVdFUl9ST09UX1VSTCwgcmV2aWV3ZXJSb3V0ZXIpO1xuXG5leHBvcnQgZGVmYXVsdCBodHRwU2VydmVyO1xuIl19