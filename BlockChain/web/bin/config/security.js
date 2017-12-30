'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  app.enable('trust proxy');

  app.use((0, _helmet2.default)({
    noCache: false,
    frameguard: false
  }));

  app.use(['reviewer/api/'], //'agency/api/'],
  (0, _expressRateLimit2.default)({
    windowMs: 30 * 1000,
    delayMs: 0,
    max: 50
  }));

  const csrfProtection = (0, _csurf2.default)({
    cookie: true
  });

  app.get('/*', csrfProtection, (req, res, next) => {
    if (!res.locals) {
      res.locals = {};
    }
    res.locals.ct = req.csrfToken();
    next();
  });
};

var _expressRateLimit = require('express-rate-limit');

var _expressRateLimit2 = _interopRequireDefault(_expressRateLimit);

var _csurf = require('csurf');

var _csurf2 = _interopRequireDefault(_csurf);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9jb25maWcvc2VjdXJpdHkuanMiXSwibmFtZXMiOlsiYXBwIiwiZW5hYmxlIiwidXNlIiwibm9DYWNoZSIsImZyYW1lZ3VhcmQiLCJ3aW5kb3dNcyIsImRlbGF5TXMiLCJtYXgiLCJjc3JmUHJvdGVjdGlvbiIsImNvb2tpZSIsImdldCIsInJlcSIsInJlcyIsIm5leHQiLCJsb2NhbHMiLCJjdCIsImNzcmZUb2tlbiJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztrQkFNZSxVQUFTQSxHQUFULEVBQWM7QUFDM0JBLE1BQUlDLE1BQUosQ0FBVyxhQUFYOztBQUVBRCxNQUFJRSxHQUFKLENBQVEsc0JBQU87QUFDYkMsYUFBUyxLQURJO0FBRWJDLGdCQUFZO0FBRkMsR0FBUCxDQUFSOztBQUtBSixNQUFJRSxHQUFKLENBQVEsQ0FBQyxlQUFELENBQVIsRUFBMkI7QUFDM0Isa0NBQWlCO0FBQ2ZHLGNBQVUsS0FBSyxJQURBO0FBRWZDLGFBQVMsQ0FGTTtBQUdmQyxTQUFLO0FBSFUsR0FBakIsQ0FEQTs7QUFPQSxRQUFNQyxpQkFBaUIscUJBQUs7QUFDMUJDLFlBQVE7QUFEa0IsR0FBTCxDQUF2Qjs7QUFJQVQsTUFBSVUsR0FBSixDQUFRLElBQVIsRUFBY0YsY0FBZCxFQUE4QixDQUFDRyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsSUFBWCxLQUFvQjtBQUNoRCxRQUFJLENBQUNELElBQUlFLE1BQVQsRUFBaUI7QUFDZkYsVUFBSUUsTUFBSixHQUFhLEVBQWI7QUFDRDtBQUNERixRQUFJRSxNQUFKLENBQVdDLEVBQVgsR0FBZ0JKLElBQUlLLFNBQUosRUFBaEI7QUFDQUg7QUFDRCxHQU5EO0FBUUQsQzs7QUEvQkQ7Ozs7QUFDQTs7OztBQUNBIiwiZmlsZSI6InNlY3VyaXR5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZXhwcmVzc1JhdGVMaW1pdCBmcm9tICdleHByZXNzLXJhdGUtbGltaXQnO1xuaW1wb3J0IGNzcmYgZnJvbSAnY3N1cmYnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmVuYWJsZSgndHJ1c3QgcHJveHknKTtcblxuICBhcHAudXNlKGhlbG1ldCh7XG4gICAgbm9DYWNoZTogZmFsc2UsXG4gICAgZnJhbWVndWFyZDogZmFsc2VcbiAgfSkpO1xuXG4gIGFwcC51c2UoWydyZXZpZXdlci9hcGkvJ10sIC8vJ2FnZW5jeS9hcGkvJ10sXG4gIGV4cHJlc3NSYXRlTGltaXQoe1xuICAgIHdpbmRvd01zOiAzMCAqIDEwMDAsXG4gICAgZGVsYXlNczogMCxcbiAgICBtYXg6IDUwXG4gIH0pKTtcblxuICBjb25zdCBjc3JmUHJvdGVjdGlvbiA9IGNzcmYoe1xuICAgIGNvb2tpZTogdHJ1ZVxuICB9KTtcblxuICBhcHAuZ2V0KCcvKicsIGNzcmZQcm90ZWN0aW9uLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoIXJlcy5sb2NhbHMpIHtcbiAgICAgIHJlcy5sb2NhbHMgPSB7fTtcbiAgICB9XG4gICAgcmVzLmxvY2Fscy5jdCA9IHJlcS5jc3JmVG9rZW4oKTtcbiAgICBuZXh0KCk7XG4gIH0pO1xuXG59XG4iXX0=