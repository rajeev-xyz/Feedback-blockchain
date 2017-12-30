'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  const isDev = app.get('env') === 'development';

  // Configure Express
  app.set('view engine', 'pug');
  app.use((0, _compression2.default)({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return _compression2.default.filter(req, res);
    }
  }));
  app.use(require('cookie-parser')());
  app.use(_bodyParser2.default.urlencoded({
    extended: true
  }));
  app.use(_bodyParser2.default.json());

  // Serve static files with lower priority
  app.use(_express2.default.static(_path2.default.resolve(__dirname, '../..', 'static')));
  const webpackConfig = isDev ? require('../../webpack.config.dev').default : require('../webpack.config.prod').default;
  if (isDev) {
    const webpack = require('webpack');
    const compiler = webpack(webpackConfig);
    // Configure logging
    app.use((0, _morgan2.default)('dev'));
    // Configure webpack
    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: false,
      publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
  } else {
    console.log(webpackConfig.output.path);
    app.use(_express2.default.static(webpackConfig.output.path));
  }

  // Set up internationalization for the backend
  (0, _i18n2.default)(app);

  // Set up security features if running in the cloud
  if (process.env.VCAP_APPLICATION) {
    require('./security').default(app);
  }
};

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9jb25maWcvZXhwcmVzcy5qcyJdLCJuYW1lcyI6WyJhcHAiLCJpc0RldiIsImdldCIsInNldCIsInVzZSIsImZpbHRlciIsInJlcSIsInJlcyIsImhlYWRlcnMiLCJyZXF1aXJlIiwidXJsZW5jb2RlZCIsImV4dGVuZGVkIiwianNvbiIsInN0YXRpYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJ3ZWJwYWNrQ29uZmlnIiwiZGVmYXVsdCIsIndlYnBhY2siLCJjb21waWxlciIsIm5vSW5mbyIsInB1YmxpY1BhdGgiLCJvdXRwdXQiLCJjb25zb2xlIiwibG9nIiwicGF0aCIsInByb2Nlc3MiLCJlbnYiLCJWQ0FQX0FQUExJQ0FUSU9OIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O2tCQVNlLFVBQVVBLEdBQVYsRUFBZTtBQUM1QixRQUFNQyxRQUFRRCxJQUFJRSxHQUFKLENBQVEsS0FBUixNQUFtQixhQUFqQzs7QUFFQTtBQUNBRixNQUFJRyxHQUFKLENBQVEsYUFBUixFQUF1QixLQUF2QjtBQUNBSCxNQUFJSSxHQUFKLENBQVEsMkJBQVk7QUFDbEJDLFlBQVEsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEtBQWM7QUFDcEIsVUFBSUQsSUFBSUUsT0FBSixDQUFZLGtCQUFaLENBQUosRUFBcUM7QUFDbkMsZUFBTyxLQUFQO0FBQ0Q7QUFDRCxhQUFPLHNCQUFZSCxNQUFaLENBQW1CQyxHQUFuQixFQUF3QkMsR0FBeEIsQ0FBUDtBQUNEO0FBTmlCLEdBQVosQ0FBUjtBQVFBUCxNQUFJSSxHQUFKLENBQVFLLFFBQVEsZUFBUixHQUFSO0FBQ0FULE1BQUlJLEdBQUosQ0FBUSxxQkFBV00sVUFBWCxDQUFzQjtBQUM1QkMsY0FBVTtBQURrQixHQUF0QixDQUFSO0FBR0FYLE1BQUlJLEdBQUosQ0FBUSxxQkFBV1EsSUFBWCxFQUFSOztBQUVBO0FBQ0FaLE1BQUlJLEdBQUosQ0FBUSxrQkFBUVMsTUFBUixDQUFlLGVBQUtDLE9BQUwsQ0FBYUMsU0FBYixFQUF3QixPQUF4QixFQUFpQyxRQUFqQyxDQUFmLENBQVI7QUFDQSxRQUFNQyxnQkFBZ0JmLFFBQVFRLFFBQVEsMEJBQVIsRUFBb0NRLE9BQTVDLEdBQXNEUixRQUFRLHdCQUFSLEVBQWtDUSxPQUE5RztBQUNBLE1BQUloQixLQUFKLEVBQVc7QUFDVCxVQUFNaUIsVUFBVVQsUUFBUSxTQUFSLENBQWhCO0FBQ0EsVUFBTVUsV0FBV0QsUUFBUUYsYUFBUixDQUFqQjtBQUNBO0FBQ0FoQixRQUFJSSxHQUFKLENBQVEsc0JBQU8sS0FBUCxDQUFSO0FBQ0E7QUFDQUosUUFBSUksR0FBSixDQUFRSyxRQUFRLHdCQUFSLEVBQWtDVSxRQUFsQyxFQUE0QztBQUNsREMsY0FBUSxLQUQwQztBQUVsREMsa0JBQVlMLGNBQWNNLE1BQWQsQ0FBcUJEO0FBRmlCLEtBQTVDLENBQVI7QUFJQXJCLFFBQUlJLEdBQUosQ0FBUUssUUFBUSx3QkFBUixFQUFrQ1UsUUFBbEMsQ0FBUjtBQUNELEdBWEQsTUFXTztBQUNMSSxZQUFRQyxHQUFSLENBQVlSLGNBQWNNLE1BQWQsQ0FBcUJHLElBQWpDO0FBQ0F6QixRQUFJSSxHQUFKLENBQVEsa0JBQVFTLE1BQVIsQ0FBZUcsY0FBY00sTUFBZCxDQUFxQkcsSUFBcEMsQ0FBUjtBQUNEOztBQUVEO0FBQ0Esc0JBQVd6QixHQUFYOztBQUVBO0FBQ0EsTUFBSTBCLFFBQVFDLEdBQVIsQ0FBWUMsZ0JBQWhCLEVBQWtDO0FBQ2hDbkIsWUFBUSxZQUFSLEVBQXNCUSxPQUF0QixDQUE4QmpCLEdBQTlCO0FBQ0g7QUFDQSxDOztBQXBERDs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0EiLCJmaWxlIjoiZXhwcmVzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgaTE4bkNvbmZpZyBmcm9tICcuL2kxOG4nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoYXBwKSB7XG4gIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgLy8gQ29uZmlndXJlIEV4cHJlc3NcbiAgYXBwLnNldCgndmlldyBlbmdpbmUnLCAncHVnJyk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oe1xuICAgIGZpbHRlcjogKHJlcSwgcmVzKSA9PiB7XG4gICAgICBpZiAocmVxLmhlYWRlcnNbJ3gtbm8tY29tcHJlc3Npb24nXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29tcHJlc3Npb24uZmlsdGVyKHJlcSwgcmVzKTtcbiAgICB9XG4gIH0pKTtcbiAgYXBwLnVzZShyZXF1aXJlKCdjb29raWUtcGFyc2VyJykoKSk7XG4gIGFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHtcbiAgICBleHRlbmRlZDogdHJ1ZVxuICB9KSk7XG4gIGFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuXG4gIC8vIFNlcnZlIHN0YXRpYyBmaWxlcyB3aXRoIGxvd2VyIHByaW9yaXR5XG4gIGFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uJywgJ3N0YXRpYycpKSk7XG4gIGNvbnN0IHdlYnBhY2tDb25maWcgPSBpc0RldiA/IHJlcXVpcmUoJy4uLy4uL3dlYnBhY2suY29uZmlnLmRldicpLmRlZmF1bHQgOiByZXF1aXJlKCcuLi93ZWJwYWNrLmNvbmZpZy5wcm9kJykuZGVmYXVsdDtcbiAgaWYgKGlzRGV2KSB7XG4gICAgY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcbiAgICBjb25zdCBjb21waWxlciA9IHdlYnBhY2sod2VicGFja0NvbmZpZyk7XG4gICAgLy8gQ29uZmlndXJlIGxvZ2dpbmdcbiAgICBhcHAudXNlKG1vcmdhbignZGV2JykpO1xuICAgIC8vIENvbmZpZ3VyZSB3ZWJwYWNrXG4gICAgYXBwLnVzZShyZXF1aXJlKCd3ZWJwYWNrLWRldi1taWRkbGV3YXJlJykoY29tcGlsZXIsIHtcbiAgICAgIG5vSW5mbzogZmFsc2UsXG4gICAgICBwdWJsaWNQYXRoOiB3ZWJwYWNrQ29uZmlnLm91dHB1dC5wdWJsaWNQYXRoXG4gICAgfSkpO1xuICAgIGFwcC51c2UocmVxdWlyZSgnd2VicGFjay1ob3QtbWlkZGxld2FyZScpKGNvbXBpbGVyKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2cod2VicGFja0NvbmZpZy5vdXRwdXQucGF0aCk7XG4gICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyh3ZWJwYWNrQ29uZmlnLm91dHB1dC5wYXRoKSk7XG4gIH1cblxuICAvLyBTZXQgdXAgaW50ZXJuYXRpb25hbGl6YXRpb24gZm9yIHRoZSBiYWNrZW5kXG4gIGkxOG5Db25maWcoYXBwKTtcblxuICAvLyBTZXQgdXAgc2VjdXJpdHkgZmVhdHVyZXMgaWYgcnVubmluZyBpbiB0aGUgY2xvdWRcbiAgaWYgKHByb2Nlc3MuZW52LlZDQVBfQVBQTElDQVRJT04pIHtcbiAgICByZXF1aXJlKCcuL3NlY3VyaXR5JykuZGVmYXVsdChhcHApO1xufVxufVxuIl19