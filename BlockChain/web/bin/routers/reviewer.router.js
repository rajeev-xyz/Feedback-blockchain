'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wsConfig = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _reviewerPeer = require('../blockchain/reviewerPeer');

var ReviewerPeer = _interopRequireWildcard(_reviewerPeer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

console.log('importing reviewerpeer......');
const router = _express2.default.Router();

// Render main page
router.get('/', (req, res) => {
  // res.render('reviewer-main', { reviewerActive: true });
  res.send('hello world');
});

// Feedback Processing

router.post('/api/reviews', (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    let { status } = req.body;
    if (typeof status === 'string' && status[0]) {
      status = status[0].toUpperCase();
    }
    try {
      let reviews = yield ReviewerPeer.getReviews(status);
      res.json(reviews);
    } catch (e) {
      res.json({ error: 'Error accessing blockchain.' });
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());

router.post('/api/file-review', (() => {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    console.log(req.body);
    console.log(req.body.review);
    if (
    //typeof req.body.user !== 'object' ||
    typeof req.body.review != 'object') {
      res.json({ error: 'Invalid request!' });
      return;
    }

    try {
      const { user, review } = req.body;
      yield ReviewerPeer.fileReview({
        date: new Date(),
        description: review.description,
        isHappy: review.isHappy
      });
      res.json({ success: true });
      return;
    } catch (e) {
      console.log(e);
      res.json({ error: 'Error accessing blockchain!' });
      return;
    }
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})());

router.get('*', (req, res) => {
  res.render('reviewer-main', { reviewerActive: true });
});

function wsConfig(io) {
  ReviewerPeer.on('block', block => {
    io.emit('block', block);
  });
}

exports.default = router;
exports.wsConfig = wsConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9yb3V0ZXJzL3Jldmlld2VyLnJvdXRlci5qcyJdLCJuYW1lcyI6WyJSZXZpZXdlclBlZXIiLCJjb25zb2xlIiwibG9nIiwicm91dGVyIiwiUm91dGVyIiwiZ2V0IiwicmVxIiwicmVzIiwic2VuZCIsInBvc3QiLCJzdGF0dXMiLCJib2R5IiwidG9VcHBlckNhc2UiLCJyZXZpZXdzIiwiZ2V0UmV2aWV3cyIsImpzb24iLCJlIiwiZXJyb3IiLCJyZXZpZXciLCJ1c2VyIiwiZmlsZVJldmlldyIsImRhdGUiLCJEYXRlIiwiZGVzY3JpcHRpb24iLCJpc0hhcHB5Iiwic3VjY2VzcyIsInJlbmRlciIsInJldmlld2VyQWN0aXZlIiwid3NDb25maWciLCJpbyIsIm9uIiwiYmxvY2siLCJlbWl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFFQTs7SUFBWUEsWTs7Ozs7Ozs7QUFFWkMsUUFBUUMsR0FBUixDQUFZLDhCQUFaO0FBQ0EsTUFBTUMsU0FBUyxrQkFBUUMsTUFBUixFQUFmOztBQUVBO0FBQ0FELE9BQU9FLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLENBQUNDLEdBQUQsRUFBTUMsR0FBTixLQUFjO0FBQzdCO0FBQ0FBLE1BQUlDLElBQUosQ0FBUyxhQUFUO0FBQ0EsQ0FIRDs7QUFLQTs7QUFFQUwsT0FBT00sSUFBUCxDQUFZLGNBQVo7QUFBQSwrQkFBNEIsV0FBT0gsR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQzlDLFFBQUksRUFBRUcsTUFBRixLQUFhSixJQUFJSyxJQUFyQjtBQUNBLFFBQUksT0FBT0QsTUFBUCxLQUFrQixRQUFsQixJQUE4QkEsT0FBTyxDQUFQLENBQWxDLEVBQTZDO0FBQzNDQSxlQUFTQSxPQUFPLENBQVAsRUFBVUUsV0FBVixFQUFUO0FBQ0Q7QUFDRCxRQUFJO0FBQ0YsVUFBSUMsVUFBVSxNQUFNYixhQUFhYyxVQUFiLENBQXdCSixNQUF4QixDQUFwQjtBQUNBSCxVQUFJUSxJQUFKLENBQVNGLE9BQVQ7QUFDRCxLQUhELENBR0UsT0FBT0csQ0FBUCxFQUFVO0FBQ1ZULFVBQUlRLElBQUosQ0FBUyxFQUFFRSxPQUFPLDZCQUFULEVBQVQ7QUFDRDtBQUNGLEdBWEQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYUFkLE9BQU9NLElBQVAsQ0FBWSxrQkFBWjtBQUFBLGdDQUFnQyxXQUFPSCxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDbEROLFlBQVFDLEdBQVIsQ0FBWUksSUFBSUssSUFBaEI7QUFDQVYsWUFBUUMsR0FBUixDQUFZSSxJQUFJSyxJQUFKLENBQVNPLE1BQXJCO0FBQ0E7QUFDRTtBQUNBLFdBQU9aLElBQUlLLElBQUosQ0FBU08sTUFBaEIsSUFBMEIsUUFGNUIsRUFFc0M7QUFDcENYLFVBQUlRLElBQUosQ0FBUyxFQUFFRSxPQUFPLGtCQUFULEVBQVQ7QUFDQTtBQUNEOztBQUVELFFBQUk7QUFDRixZQUFNLEVBQUVFLElBQUYsRUFBUUQsTUFBUixLQUFtQlosSUFBSUssSUFBN0I7QUFDQSxZQUFNWCxhQUFhb0IsVUFBYixDQUF3QjtBQUMxQkMsY0FBTSxJQUFJQyxJQUFKLEVBRG9CO0FBRTFCQyxxQkFBYUwsT0FBT0ssV0FGTTtBQUcxQkMsaUJBQVNOLE9BQU9NO0FBSFUsT0FBeEIsQ0FBTjtBQUtBakIsVUFBSVEsSUFBSixDQUFTLEVBQUVVLFNBQVMsSUFBWCxFQUFUO0FBQ0E7QUFDRCxLQVRELENBU0UsT0FBT1QsQ0FBUCxFQUFVO0FBQ1ZmLGNBQVFDLEdBQVIsQ0FBWWMsQ0FBWjtBQUNBVCxVQUFJUSxJQUFKLENBQVMsRUFBRUUsT0FBTyw2QkFBVCxFQUFUO0FBQ0E7QUFDRDtBQUNGLEdBeEJEOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTBCQWQsT0FBT0UsR0FBUCxDQUFXLEdBQVgsRUFBZ0IsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEtBQWM7QUFDMUJBLE1BQUltQixNQUFKLENBQVcsZUFBWCxFQUE0QixFQUFFQyxnQkFBZ0IsSUFBbEIsRUFBNUI7QUFDSCxDQUZEOztBQUlBLFNBQVNDLFFBQVQsQ0FBa0JDLEVBQWxCLEVBQXNCO0FBQ3BCN0IsZUFBYThCLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUJDLFNBQVM7QUFDaENGLE9BQUdHLElBQUgsQ0FBUSxPQUFSLEVBQWlCRCxLQUFqQjtBQUNELEdBRkQ7QUFHRDs7a0JBRWM1QixNO1FBQ055QixRLEdBQUFBLFEiLCJmaWxlIjoicmV2aWV3ZXIucm91dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5cbmltcG9ydCAqIGFzIFJldmlld2VyUGVlciBmcm9tICcuLi9ibG9ja2NoYWluL3Jldmlld2VyUGVlcic7XG5cbmNvbnNvbGUubG9nKCdpbXBvcnRpbmcgcmV2aWV3ZXJwZWVyLi4uLi4uJyk7XG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBSZW5kZXIgbWFpbiBwYWdlXG5yb3V0ZXIuZ2V0KCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gLy8gcmVzLnJlbmRlcigncmV2aWV3ZXItbWFpbicsIHsgcmV2aWV3ZXJBY3RpdmU6IHRydWUgfSk7XG5cdHJlcy5zZW5kKCdoZWxsbyB3b3JsZCcpO1xufSk7XG5cbi8vIEZlZWRiYWNrIFByb2Nlc3Npbmdcblxucm91dGVyLnBvc3QoJy9hcGkvcmV2aWV3cycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBsZXQgeyBzdGF0dXMgfSA9IHJlcS5ib2R5O1xuICBpZiAodHlwZW9mIHN0YXR1cyA9PT0gJ3N0cmluZycgJiYgc3RhdHVzWzBdKSB7XG4gICAgc3RhdHVzID0gc3RhdHVzWzBdLnRvVXBwZXJDYXNlKCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBsZXQgcmV2aWV3cyA9IGF3YWl0IFJldmlld2VyUGVlci5nZXRSZXZpZXdzKHN0YXR1cyk7XG4gICAgcmVzLmpzb24ocmV2aWV3cyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXMuanNvbih7IGVycm9yOiAnRXJyb3IgYWNjZXNzaW5nIGJsb2NrY2hhaW4uJyB9KTtcbiAgfVxufSk7XG5cbnJvdXRlci5wb3N0KCcvYXBpL2ZpbGUtcmV2aWV3JywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnNvbGUubG9nKHJlcS5ib2R5KTtcbiAgY29uc29sZS5sb2cocmVxLmJvZHkucmV2aWV3KTtcbiAgaWYgKFxuICAgIC8vdHlwZW9mIHJlcS5ib2R5LnVzZXIgIT09ICdvYmplY3QnIHx8XG4gICAgdHlwZW9mIHJlcS5ib2R5LnJldmlldyAhPSAnb2JqZWN0Jykge1xuICAgIHJlcy5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIHJlcXVlc3QhJyB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHsgdXNlciwgcmV2aWV3IH0gPSByZXEuYm9keTtcbiAgICBhd2FpdCBSZXZpZXdlclBlZXIuZmlsZVJldmlldyh7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgIGRlc2NyaXB0aW9uOiByZXZpZXcuZGVzY3JpcHRpb24sXG4gICAgICAgIGlzSGFwcHk6IHJldmlldy5pc0hhcHB5XG4gICAgfSk7XG4gICAgcmVzLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgIHJldHVybjtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHJlcy5qc29uKHsgZXJyb3I6ICdFcnJvciBhY2Nlc3NpbmcgYmxvY2tjaGFpbiEnIH0pO1xuICAgIHJldHVybjtcbiAgfVxufSk7XG5cbnJvdXRlci5nZXQoJyonLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMucmVuZGVyKCdyZXZpZXdlci1tYWluJywgeyByZXZpZXdlckFjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG5mdW5jdGlvbiB3c0NvbmZpZyhpbykge1xuICBSZXZpZXdlclBlZXIub24oJ2Jsb2NrJywgYmxvY2sgPT4ge1xuICAgIGlvLmVtaXQoJ2Jsb2NrJywgYmxvY2spO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyO1xuZXhwb3J0IHsgd3NDb25maWcgfTtcbiJdfQ==