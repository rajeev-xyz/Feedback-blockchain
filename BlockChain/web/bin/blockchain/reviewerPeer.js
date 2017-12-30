'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeListener = exports.prependListener = exports.addListener = exports.once = exports.on = exports.fileReview = exports.getReviews = undefined;

let getReviews = exports.getReviews = (() => {
  var _ref = _asyncToGenerator(function* (status) {
    if (!(0, _setup.isReady)()) {
      return;
    }
    try {
      if (typeof status !== 'string') {
        status = undefined;
      }
      const reviews = yield query('review_ls', { status });
      return reviews;
    } catch (e) {
      let errMessage;
      if (status) {
        errMessage = `Error getting reviews with status ${status}: ${e.message}`;
      } else {
        errMessage = `Error getting all reviews: ${e.message}`;
      }
      throw (0, _utils.wrapError)(errMessage, e);
    }
  });

  return function getReviews(_x) {
    return _ref.apply(this, arguments);
  };
})();

let fileReview = exports.fileReview = (() => {
  var _ref2 = _asyncToGenerator(function* (review) {
    if (!(0, _setup.isReady)()) {
      return;
    }
    try {
      const c = Object.assign({}, review);
      const successResult = yield invoke('review_file', c);
      if (successResult) {
        throw new Error(successResult);
      }
      return c.uuid;
    } catch (e) {
      throw (0, _utils.wrapError)(`Error filing a new review: ${e.message}`, e);
    }
  });

  return function fileReview(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.getBlocks = getBlocks;

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

var _setup = require('./setup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function getBlocks(noOfLastBlocks) {
  return _setup.reviewerClient.getBlocks(noOfLastBlocks);
}

const on = exports.on = _setup.reviewerClient.on.bind(_setup.reviewerClient);
const once = exports.once = _setup.reviewerClient.once.bind(_setup.reviewerClient);
const addListener = exports.addListener = _setup.reviewerClient.addListener.bind(_setup.reviewerClient);
const prependListener = exports.prependListener = _setup.reviewerClient.prependListener.bind(_setup.reviewerClient);
const removeListener = exports.removeListener = _setup.reviewerClient.removeListener.bind(_setup.reviewerClient);

function invoke(fcn, ...args) {
  return _setup.reviewerClient.invoke(_config2.default.chaincodeId, _config2.default.chaincodeVersion, fcn, ...args);
}

function query(fcn, ...args) {
  return _setup.reviewerClient.query(_config2.default.chaincodeId, _config2.default.chaincodeVersion, fcn, ...args);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9ibG9ja2NoYWluL3Jldmlld2VyUGVlci5qcyJdLCJuYW1lcyI6WyJzdGF0dXMiLCJ1bmRlZmluZWQiLCJyZXZpZXdzIiwicXVlcnkiLCJlIiwiZXJyTWVzc2FnZSIsIm1lc3NhZ2UiLCJnZXRSZXZpZXdzIiwicmV2aWV3IiwiYyIsIk9iamVjdCIsImFzc2lnbiIsInN1Y2Nlc3NSZXN1bHQiLCJpbnZva2UiLCJFcnJvciIsInV1aWQiLCJmaWxlUmV2aWV3IiwiZ2V0QmxvY2tzIiwibm9PZkxhc3RCbG9ja3MiLCJvbiIsImJpbmQiLCJvbmNlIiwiYWRkTGlzdGVuZXIiLCJwcmVwZW5kTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImZjbiIsImFyZ3MiLCJjaGFpbmNvZGVJZCIsImNoYWluY29kZVZlcnNpb24iXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OzsrQkFNTyxXQUEwQkEsTUFBMUIsRUFBa0M7QUFDdkMsUUFBSSxDQUFDLHFCQUFMLEVBQWdCO0FBQ2Q7QUFDRDtBQUNELFFBQUk7QUFDRixVQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUJBLGlCQUFTQyxTQUFUO0FBQ0Q7QUFDRCxZQUFNQyxVQUFVLE1BQU1DLE1BQU0sV0FBTixFQUFtQixFQUFFSCxNQUFGLEVBQW5CLENBQXRCO0FBQ0EsYUFBT0UsT0FBUDtBQUNELEtBTkQsQ0FNRSxPQUFPRSxDQUFQLEVBQVU7QUFDVixVQUFJQyxVQUFKO0FBQ0EsVUFBSUwsTUFBSixFQUFZO0FBQ1ZLLHFCQUFjLHFDQUFvQ0wsTUFBTyxLQUFJSSxFQUFFRSxPQUFRLEVBQXZFO0FBQ0QsT0FGRCxNQUVPO0FBQ0xELHFCQUFjLDhCQUE2QkQsRUFBRUUsT0FBUSxFQUFyRDtBQUNEO0FBQ0QsWUFBTSxzQkFBVUQsVUFBVixFQUFzQkQsQ0FBdEIsQ0FBTjtBQUNEO0FBQ0YsRzs7a0JBbkJxQkcsVTs7Ozs7O2dDQXFCZixXQUEwQkMsTUFBMUIsRUFBa0M7QUFDdkMsUUFBSSxDQUFDLHFCQUFMLEVBQWdCO0FBQ2Q7QUFDRDtBQUNELFFBQUk7QUFDRixZQUFNQyxJQUFJQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQkgsTUFBbEIsQ0FBVjtBQUNBLFlBQU1JLGdCQUFnQixNQUFNQyxPQUFPLGFBQVAsRUFBc0JKLENBQXRCLENBQTVCO0FBQ0EsVUFBSUcsYUFBSixFQUFtQjtBQUNqQixjQUFNLElBQUlFLEtBQUosQ0FBVUYsYUFBVixDQUFOO0FBQ0Q7QUFDRCxhQUFPSCxFQUFFTSxJQUFUO0FBQ0QsS0FQRCxDQU9FLE9BQU9YLENBQVAsRUFBVTtBQUNWLFlBQU0sc0JBQVcsOEJBQTZCQSxFQUFFRSxPQUFRLEVBQWxELEVBQXFERixDQUFyRCxDQUFOO0FBQ0Q7QUFDRixHOztrQkFkcUJZLFU7Ozs7O1FBZ0JOQyxTLEdBQUFBLFM7O0FBekNoQjs7OztBQUNBOztBQUNBOzs7Ozs7QUF1Q08sU0FBU0EsU0FBVCxDQUFtQkMsY0FBbkIsRUFBbUM7QUFDeEMsU0FBTyxzQkFBT0QsU0FBUCxDQUFpQkMsY0FBakIsQ0FBUDtBQUNEOztBQUVNLE1BQU1DLGtCQUFLLHNCQUFPQSxFQUFQLENBQVVDLElBQVYsdUJBQVg7QUFDQSxNQUFNQyxzQkFBTyxzQkFBT0EsSUFBUCxDQUFZRCxJQUFaLHVCQUFiO0FBQ0EsTUFBTUUsb0NBQWMsc0JBQU9BLFdBQVAsQ0FBbUJGLElBQW5CLHVCQUFwQjtBQUNBLE1BQU1HLDRDQUFrQixzQkFBT0EsZUFBUCxDQUF1QkgsSUFBdkIsdUJBQXhCO0FBQ0EsTUFBTUksMENBQWlCLHNCQUFPQSxjQUFQLENBQXNCSixJQUF0Qix1QkFBdkI7O0FBRVAsU0FBU1AsTUFBVCxDQUFnQlksR0FBaEIsRUFBcUIsR0FBR0MsSUFBeEIsRUFBOEI7QUFDNUIsU0FBTyxzQkFBT2IsTUFBUCxDQUNMLGlCQUFPYyxXQURGLEVBQ2UsaUJBQU9DLGdCQUR0QixFQUN3Q0gsR0FEeEMsRUFDNkMsR0FBR0MsSUFEaEQsQ0FBUDtBQUVEOztBQUVELFNBQVN2QixLQUFULENBQWVzQixHQUFmLEVBQW9CLEdBQUdDLElBQXZCLEVBQTZCO0FBQzNCLFNBQU8sc0JBQU92QixLQUFQLENBQ0wsaUJBQU93QixXQURGLEVBQ2UsaUJBQU9DLGdCQUR0QixFQUN3Q0gsR0FEeEMsRUFDNkMsR0FBR0MsSUFEaEQsQ0FBUDtBQUVEIiwiZmlsZSI6InJldmlld2VyUGVlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyB3cmFwRXJyb3IgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHJldmlld2VyQ2xpZW50IGFzIGNsaWVudCwgaXNSZWFkeSB9IGZyb20gJy4vc2V0dXAnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmV2aWV3cyhzdGF0dXMpIHtcbiAgaWYgKCFpc1JlYWR5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIHN0YXR1cyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHN0YXR1cyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgcmV2aWV3cyA9IGF3YWl0IHF1ZXJ5KCdyZXZpZXdfbHMnLCB7IHN0YXR1cyB9KTtcbiAgICByZXR1cm4gcmV2aWV3cztcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxldCBlcnJNZXNzYWdlO1xuICAgIGlmIChzdGF0dXMpIHtcbiAgICAgIGVyck1lc3NhZ2UgPSBgRXJyb3IgZ2V0dGluZyByZXZpZXdzIHdpdGggc3RhdHVzICR7c3RhdHVzfTogJHtlLm1lc3NhZ2V9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyTWVzc2FnZSA9IGBFcnJvciBnZXR0aW5nIGFsbCByZXZpZXdzOiAke2UubWVzc2FnZX1gO1xuICAgIH1cbiAgICB0aHJvdyB3cmFwRXJyb3IoZXJyTWVzc2FnZSwgZSk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVSZXZpZXcocmV2aWV3KSB7XG4gIGlmICghaXNSZWFkeSgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgYyA9IE9iamVjdC5hc3NpZ24oe30sIHJldmlldyk7XG4gICAgY29uc3Qgc3VjY2Vzc1Jlc3VsdCA9IGF3YWl0IGludm9rZSgncmV2aWV3X2ZpbGUnLCBjKTtcbiAgICBpZiAoc3VjY2Vzc1Jlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHN1Y2Nlc3NSZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gYy51dWlkO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgd3JhcEVycm9yKGBFcnJvciBmaWxpbmcgYSBuZXcgcmV2aWV3OiAke2UubWVzc2FnZX1gLCBlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmxvY2tzKG5vT2ZMYXN0QmxvY2tzKSB7XG4gIHJldHVybiBjbGllbnQuZ2V0QmxvY2tzKG5vT2ZMYXN0QmxvY2tzKTtcbn1cblxuZXhwb3J0IGNvbnN0IG9uID0gY2xpZW50Lm9uLmJpbmQoY2xpZW50KTtcbmV4cG9ydCBjb25zdCBvbmNlID0gY2xpZW50Lm9uY2UuYmluZChjbGllbnQpO1xuZXhwb3J0IGNvbnN0IGFkZExpc3RlbmVyID0gY2xpZW50LmFkZExpc3RlbmVyLmJpbmQoY2xpZW50KTtcbmV4cG9ydCBjb25zdCBwcmVwZW5kTGlzdGVuZXIgPSBjbGllbnQucHJlcGVuZExpc3RlbmVyLmJpbmQoY2xpZW50KTtcbmV4cG9ydCBjb25zdCByZW1vdmVMaXN0ZW5lciA9IGNsaWVudC5yZW1vdmVMaXN0ZW5lci5iaW5kKGNsaWVudCk7XG5cbmZ1bmN0aW9uIGludm9rZShmY24sIC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGNsaWVudC5pbnZva2UoXG4gICAgY29uZmlnLmNoYWluY29kZUlkLCBjb25maWcuY2hhaW5jb2RlVmVyc2lvbiwgZmNuLCAuLi5hcmdzKTtcbn1cblxuZnVuY3Rpb24gcXVlcnkoZmNuLCAuLi5hcmdzKSB7XG4gIHJldHVybiBjbGllbnQucXVlcnkoXG4gICAgY29uZmlnLmNoYWluY29kZUlkLCBjb25maWcuY2hhaW5jb2RlVmVyc2lvbiwgZmNuLCAuLi5hcmdzKTtcbn1cbiJdfQ==