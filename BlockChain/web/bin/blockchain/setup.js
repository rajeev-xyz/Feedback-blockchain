'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.agencyClient = exports.reviewerClient = undefined;
exports.subscribeStatus = subscribeStatus;
exports.getStatus = getStatus;
exports.isReady = isReady;

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let status = 'down';
let statusChangedCallbacks = [];

// Setup clients per organization
const reviewerClient = new _utils.OrganizationClient(_config2.default.channelName, _config2.default.orderer0, _config2.default.reviewerOrg.peer, _config2.default.reviewerOrg.ca, _config2.default.reviewerOrg.admin);
const agencyClient = new _utils.OrganizationClient(_config2.default.channelName, _config2.default.orderer0, _config2.default.agencyOrg.peer, _config2.default.agencyOrg.ca, _config2.default.agencyOrg.admin);
function setStatus(s) {
  status = s;

  setTimeout(() => {
    statusChangedCallbacks.filter(f => typeof f === 'function').forEach(f => f(s));
  }, 1000);
}

function subscribeStatus(cb) {
  if (typeof cb === 'function') {
    statusChangedCallbacks.push(cb);
  }
}

function getStatus() {
  return status;
}

function isReady() {
  return status === 'ready';
}

function getAdminOrgs() {
  return Promise.all([reviewerClient.getOrgAdmin(), agencyClient.getOrgAdmin()]);
}

_asyncToGenerator(function* () {
  // Login
  try {
    yield Promise.all([reviewerClient.login(), agencyClient.login()]);
  } catch (e) {
    console.log('Fatal error logging into blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  reviewerClient.initEventHubs();
  agencyClient.initEventHubs();

  // Bootstrap blockchain network
  try {
    yield getAdminOrgs();
    if (!(yield reviewerClient.checkChannelMembership())) {
      console.log('Default channel not found, attempting creation...');
      const createChannelResponse = yield reviewerClient.createChannel(_config2.default.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('Successfully created a new default channel.');
        console.log('Joining peers to the default channel.');
        yield Promise.all([reviewerClient.joinChannel(), agencyClient.joinChannel()]);
        // Wait for 10s for the peers to join the newly created channel
        yield new Promise(function (resolve) {
          setTimeout(resolve, 10000);
        });
      }
    }
  } catch (e) {
    console.log('Fatal error bootstrapping the blockchain network!');
    console.log(e);
    process.exit(-1);
  }

  // Initialize network
  try {
    yield Promise.all([reviewerClient.initialize(), agencyClient.initialize()]);
  } catch (e) {
    console.log('Fatal error initializing blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Install chaincode on all peers
  let installedOnReviewerOrg, installedOnAgencyOrg;

  try {
    yield getAdminOrgs();
    installedOnReviewerOrg = yield reviewerClient.checkInstalled(_config2.default.chaincodeId, _config2.default.chaincodeVersion, _config2.default.chaincodePath);
    installedOnAgencyOrg = yield agencyClient.checkInstalled(_config2.default.chaincodeId, _config2.default.chaincodeVersion, _config2.default.chaincodePath);
  } catch (e) {
    console.log('Fatal error getting installation status of the chaincode!');
    console.log(e);
    process.exit(-1);
  }

  if (!(installedOnReviewerOrg && installedOnAgencyOrg)) {
    console.log('Chaincode is not installed, attempting installation...');
    // Pull chaincode environment base image
    try {
      yield getAdminOrgs();
      const socketPath = process.env.DOCKER_SOCKET_PATH || (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock');
      const ccenvImage = process.env.DOCKER_CCENV_IMAGE || 'hyperledger/fabric-ccenv:x86_64-1.0.2';
      const listOpts = { socketPath, method: 'GET', path: '/images/json' };
      const pullOpts = {
        socketPath, method: 'POST',
        path: _url2.default.format({ pathname: '/images/create', query: { fromImage: ccenvImage } })
      };

      const images = yield new Promise(function (resolve, reject) {
        const req = _http2.default.request(listOpts, function (response) {
          let data = '';
          response.setEncoding('utf-8');
          response.on('data', function (chunk) {
            data += chunk;
          });
          response.on('end', function () {
            resolve(JSON.parse(data));
          });
        });
        req.on('error', reject);req.end();
      });

      const imageExists = images.some(function (i) {
        return i.RepoTags && i.RepoTags.some(function (tag) {
          return tag === ccenvImage;
        });
      });
      if (!imageExists) {
        console.log('Base container image not present, pulling from Docker Hub...');
        yield new Promise(function (resolve, reject) {
          const req = _http2.default.request(pullOpts, function (response) {
            response.on('data', function () {});
            response.on('end', function () {
              resolve();
            });
          });
          req.on('error', reject);req.end();
        });
        console.log('Base container image downloaded.');
      } else {
        console.log('Base container image present.');
      }
    } catch (e) {
      console.log('Fatal error pulling docker images.');
      console.log(e);
      process.exit(-1);
    }
    // Install chaincode
    const installationPromises = [reviewerClient.install(_config2.default.chaincodeId, _config2.default.chaincodeVersion, _config2.default.chaincodePath), agencyClient.install(_config2.default.chaincodeId, _config2.default.chaincodeVersion, _config2.default.chaincodePath)];
    try {
      yield Promise.all(installationPromises);
      yield new Promise(function (resolve) {
        setTimeout(resolve, 10000);
      });
      console.log('Successfully installed chaincode on the default channel.');
    } catch (e) {
      console.log('Fatal error installing chaincode on the default channel!');
      console.log(e);
      process.exit(-1);
    }

    // Instantiate chaincode on all peers
    // Instantiating the chaincode on a single peer should be enough (for now)
    try {
      // Initial contract types
      yield reviewerClient.instantiate(_config2.default.chaincodeId, _config2.default.chaincodeVersion);
      console.log('Successfully instantiated chaincode on all peers.');
      setStatus('ready');
    } catch (e) {
      console.log('Fatal error instantiating chaincode on some(all) peers!');
      console.log(e);
      process.exit(-1);
    }
  } else {
    console.log('Chaincode already installed on the blockchain network.');
    setStatus('ready');
  }
})();

// Export organization clients
exports.reviewerClient = reviewerClient;
exports.agencyClient = agencyClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9ibG9ja2NoYWluL3NldHVwLmpzIl0sIm5hbWVzIjpbInN1YnNjcmliZVN0YXR1cyIsImdldFN0YXR1cyIsImlzUmVhZHkiLCJzdGF0dXMiLCJzdGF0dXNDaGFuZ2VkQ2FsbGJhY2tzIiwicmV2aWV3ZXJDbGllbnQiLCJjaGFubmVsTmFtZSIsIm9yZGVyZXIwIiwicmV2aWV3ZXJPcmciLCJwZWVyIiwiY2EiLCJhZG1pbiIsImFnZW5jeUNsaWVudCIsImFnZW5jeU9yZyIsInNldFN0YXR1cyIsInMiLCJzZXRUaW1lb3V0IiwiZmlsdGVyIiwiZiIsImZvckVhY2giLCJjYiIsInB1c2giLCJnZXRBZG1pbk9yZ3MiLCJQcm9taXNlIiwiYWxsIiwiZ2V0T3JnQWRtaW4iLCJsb2dpbiIsImUiLCJjb25zb2xlIiwibG9nIiwicHJvY2VzcyIsImV4aXQiLCJpbml0RXZlbnRIdWJzIiwiY2hlY2tDaGFubmVsTWVtYmVyc2hpcCIsImNyZWF0ZUNoYW5uZWxSZXNwb25zZSIsImNyZWF0ZUNoYW5uZWwiLCJjaGFubmVsQ29uZmlnIiwiam9pbkNoYW5uZWwiLCJyZXNvbHZlIiwiaW5pdGlhbGl6ZSIsImluc3RhbGxlZE9uUmV2aWV3ZXJPcmciLCJpbnN0YWxsZWRPbkFnZW5jeU9yZyIsImNoZWNrSW5zdGFsbGVkIiwiY2hhaW5jb2RlSWQiLCJjaGFpbmNvZGVWZXJzaW9uIiwiY2hhaW5jb2RlUGF0aCIsInNvY2tldFBhdGgiLCJlbnYiLCJET0NLRVJfU09DS0VUX1BBVEgiLCJwbGF0Zm9ybSIsImNjZW52SW1hZ2UiLCJET0NLRVJfQ0NFTlZfSU1BR0UiLCJsaXN0T3B0cyIsIm1ldGhvZCIsInBhdGgiLCJwdWxsT3B0cyIsImZvcm1hdCIsInBhdGhuYW1lIiwicXVlcnkiLCJmcm9tSW1hZ2UiLCJpbWFnZXMiLCJyZWplY3QiLCJyZXEiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJkYXRhIiwic2V0RW5jb2RpbmciLCJvbiIsImNodW5rIiwiSlNPTiIsInBhcnNlIiwiZW5kIiwiaW1hZ2VFeGlzdHMiLCJzb21lIiwiaSIsIlJlcG9UYWdzIiwidGFnIiwiaW5zdGFsbGF0aW9uUHJvbWlzZXMiLCJpbnN0YWxsIiwiaW5zdGFudGlhdGUiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUFtQ2dCQSxlLEdBQUFBLGU7UUFNQUMsUyxHQUFBQSxTO1FBSUFDLE8sR0FBQUEsTzs7QUEzQ2hCOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFJQyxTQUFTLE1BQWI7QUFDQSxJQUFJQyx5QkFBeUIsRUFBN0I7O0FBRUE7QUFDQSxNQUFNQyxpQkFBaUIsOEJBQ3JCLGlCQUFPQyxXQURjLEVBRXJCLGlCQUFPQyxRQUZjLEVBR3JCLGlCQUFPQyxXQUFQLENBQW1CQyxJQUhFLEVBSXJCLGlCQUFPRCxXQUFQLENBQW1CRSxFQUpFLEVBS3JCLGlCQUFPRixXQUFQLENBQW1CRyxLQUxFLENBQXZCO0FBT0EsTUFBTUMsZUFBZSw4QkFDbkIsaUJBQU9OLFdBRFksRUFFbkIsaUJBQU9DLFFBRlksRUFHbkIsaUJBQU9NLFNBQVAsQ0FBaUJKLElBSEUsRUFJbkIsaUJBQU9JLFNBQVAsQ0FBaUJILEVBSkUsRUFLbkIsaUJBQU9HLFNBQVAsQ0FBaUJGLEtBTEUsQ0FBckI7QUFPQSxTQUFTRyxTQUFULENBQW1CQyxDQUFuQixFQUFzQjtBQUNwQlosV0FBU1ksQ0FBVDs7QUFFQUMsYUFBVyxNQUFNO0FBQ2ZaLDJCQUNHYSxNQURILENBQ1VDLEtBQUssT0FBT0EsQ0FBUCxLQUFhLFVBRDVCLEVBRUdDLE9BRkgsQ0FFV0QsS0FBS0EsRUFBRUgsQ0FBRixDQUZoQjtBQUdELEdBSkQsRUFJRyxJQUpIO0FBS0Q7O0FBRU0sU0FBU2YsZUFBVCxDQUF5Qm9CLEVBQXpCLEVBQTZCO0FBQ2xDLE1BQUksT0FBT0EsRUFBUCxLQUFjLFVBQWxCLEVBQThCO0FBQzVCaEIsMkJBQXVCaUIsSUFBdkIsQ0FBNEJELEVBQTVCO0FBQ0Q7QUFDRjs7QUFFTSxTQUFTbkIsU0FBVCxHQUFxQjtBQUMxQixTQUFP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QUFBNkIsT0FBeEQsQ0FBTjtBQUNBVixjQUFRQyxHQUFSLENBQVksMERBQVo7QUFDRCxLQUpELENBSUUsT0FBT0YsQ0FBUCxFQUFVO0FBQ1ZDLGNBQVFDLEdBQVIsQ0FBWSwwREFBWjtBQUNBRCxjQUFRQyxHQUFSLENBQVlGLENBQVo7QUFDQUcsY0FBUUMsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNEOztBQUVEO0FBQ0E7QUFDQSxRQUFJO0FBQ0Y7QUFDQSxZQUFNMUIsZUFBZTBFLFdBQWYsQ0FBMkIsaUJBQU9wQyxXQUFsQyxFQUNYLGlCQUFPQyxnQkFESSxDQUFOO0FBRUFoQixjQUFRQyxHQUFSLENBQVksbURBQVo7QUFDQWYsZ0JBQVUsT0FBVjtBQUNELEtBTkQsQ0FNRSxPQUFPYSxDQUFQLEVBQVU7QUFDVkMsY0FBUUMsR0FBUixDQUFZLHlEQUFaO0FBQ0FELGNBQVFDLEdBQVIsQ0FBWUYsQ0FBWjtBQUNBRyxjQUFRQyxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0Q7QUFDRixHQTNFRCxNQTJFTztBQUNMSCxZQUFRQyxHQUFSLENBQVksd0RBQVo7QUFDQWYsY0FBVSxPQUFWO0FBQ0Q7QUFDRixDQXBKRDs7QUFzSkE7UUFFRVQsYyxHQUFBQSxjO1FBQ0FPLFksR0FBQUEsWSIsImZpbGUiOiJzZXR1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBPcmdhbml6YXRpb25DbGllbnQgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuXG5sZXQgc3RhdHVzID0gJ2Rvd24nO1xubGV0IHN0YXR1c0NoYW5nZWRDYWxsYmFja3MgPSBbXTtcblxuLy8gU2V0dXAgY2xpZW50cyBwZXIgb3JnYW5pemF0aW9uXG5jb25zdCByZXZpZXdlckNsaWVudCA9IG5ldyBPcmdhbml6YXRpb25DbGllbnQoXG4gIGNvbmZpZy5jaGFubmVsTmFtZSxcbiAgY29uZmlnLm9yZGVyZXIwLFxuICBjb25maWcucmV2aWV3ZXJPcmcucGVlcixcbiAgY29uZmlnLnJldmlld2VyT3JnLmNhLFxuICBjb25maWcucmV2aWV3ZXJPcmcuYWRtaW5cbik7XG5jb25zdCBhZ2VuY3lDbGllbnQgPSBuZXcgT3JnYW5pemF0aW9uQ2xpZW50KFxuICBjb25maWcuY2hhbm5lbE5hbWUsXG4gIGNvbmZpZy5vcmRlcmVyMCxcbiAgY29uZmlnLmFnZW5jeU9yZy5wZWVyLFxuICBjb25maWcuYWdlbmN5T3JnLmNhLFxuICBjb25maWcuYWdlbmN5T3JnLmFkbWluXG4pO1xuZnVuY3Rpb24gc2V0U3RhdHVzKHMpIHtcbiAgc3RhdHVzID0gcztcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBzdGF0dXNDaGFuZ2VkQ2FsbGJhY2tzXG4gICAgICAuZmlsdGVyKGYgPT4gdHlwZW9mIGYgPT09ICdmdW5jdGlvbicpXG4gICAgICAuZm9yRWFjaChmID0+IGYocykpO1xuICB9LCAxMDAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZVN0YXR1cyhjYikge1xuICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgc3RhdHVzQ2hhbmdlZENhbGxiYWNrcy5wdXNoKGNiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuICByZXR1cm4gc3RhdHVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFkeSgpIHtcbiAgcmV0dXJuIHN0YXR1cyA9PT0gJ3JlYWR5Jztcbn1cblxuZnVuY3Rpb24gZ2V0QWRtaW5PcmdzKCkge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgIHJldmlld2VyQ2xpZW50LmdldE9yZ0FkbWluKCksXG4gICAgYWdlbmN5Q2xpZW50LmdldE9yZ0FkbWluKClcbiAgXSk7XG59XG5cbihhc3luYyAoKSA9PiB7XG4gIC8vIExvZ2luXG4gIHRyeSB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmV2aWV3ZXJDbGllbnQubG9naW4oKSxcbiAgICAgIGFnZW5jeUNsaWVudC5sb2dpbigpXG4gICAgXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZygnRmF0YWwgZXJyb3IgbG9nZ2luZyBpbnRvIGJsb2NrY2hhaW4gb3JnYW5pemF0aW9uIGNsaWVudHMhJyk7XG4gICAgY29uc29sZS5sb2coZSk7XG4gICAgcHJvY2Vzcy5leGl0KC0xKTtcbiAgfVxuXG4gIHJldmlld2VyQ2xpZW50LmluaXRFdmVudEh1YnMoKTtcbiAgYWdlbmN5Q2xpZW50LmluaXRFdmVudEh1YnMoKTtcblxuICAvLyBCb290c3RyYXAgYmxvY2tjaGFpbiBuZXR3b3JrXG4gIHRyeSB7XG4gICAgYXdhaXQgZ2V0QWRtaW5PcmdzKCk7XG4gICAgaWYgKCEoYXdhaXQgcmV2aWV3ZXJDbGllbnQuY2hlY2tDaGFubmVsTWVtYmVyc2hpcCgpKSkge1xuICAgICAgY29uc29sZS5sb2coJ0RlZmF1bHQgY2hhbm5lbCBub3QgZm91bmQsIGF0dGVtcHRpbmcgY3JlYXRpb24uLi4nKTtcbiAgICAgIGNvbnN0IGNyZWF0ZUNoYW5uZWxSZXNwb25zZSA9XG4gICAgICAgIGF3YWl0IHJldmlld2VyQ2xpZW50LmNyZWF0ZUNoYW5uZWwoY29uZmlnLmNoYW5uZWxDb25maWcpO1xuICAgICAgaWYgKGNyZWF0ZUNoYW5uZWxSZXNwb25zZS5zdGF0dXMgPT09ICdTVUNDRVNTJykge1xuICAgICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgYSBuZXcgZGVmYXVsdCBjaGFubmVsLicpO1xuICAgICAgICBjb25zb2xlLmxvZygnSm9pbmluZyBwZWVycyB0byB0aGUgZGVmYXVsdCBjaGFubmVsLicpO1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgcmV2aWV3ZXJDbGllbnQuam9pbkNoYW5uZWwoKSxcbiAgICAgICAgICBhZ2VuY3lDbGllbnQuam9pbkNoYW5uZWwoKVxuICAgICAgICBdKTtcbiAgICAgICAgLy8gV2FpdCBmb3IgMTBzIGZvciB0aGUgcGVlcnMgdG8gam9pbiB0aGUgbmV3bHkgY3JlYXRlZCBjaGFubmVsXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMDApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZygnRmF0YWwgZXJyb3IgYm9vdHN0cmFwcGluZyB0aGUgYmxvY2tjaGFpbiBuZXR3b3JrIScpO1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgtMSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIG5ldHdvcmtcbiAgdHJ5IHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICByZXZpZXdlckNsaWVudC5pbml0aWFsaXplKCksXG4gICAgICBhZ2VuY3lDbGllbnQuaW5pdGlhbGl6ZSgpXG4gICAgXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZygnRmF0YWwgZXJyb3IgaW5pdGlhbGl6aW5nIGJsb2NrY2hhaW4gb3JnYW5pemF0aW9uIGNsaWVudHMhJyk7XG4gICAgY29uc29sZS5sb2coZSk7XG4gICAgcHJvY2Vzcy5leGl0KC0xKTtcbiAgfVxuICBcbiAgLy8gSW5zdGFsbCBjaGFpbmNvZGUgb24gYWxsIHBlZXJzXG4gIGxldCBpbnN0YWxsZWRPblJldmlld2VyT3JnLCBpbnN0YWxsZWRPbkFnZW5jeU9yZztcbiAgXG4gIHRyeSB7XG4gICAgYXdhaXQgZ2V0QWRtaW5PcmdzKCk7XG4gICAgaW5zdGFsbGVkT25SZXZpZXdlck9yZyA9IGF3YWl0IHJldmlld2VyQ2xpZW50LmNoZWNrSW5zdGFsbGVkKFxuICAgICAgY29uZmlnLmNoYWluY29kZUlkLCBjb25maWcuY2hhaW5jb2RlVmVyc2lvbiwgY29uZmlnLmNoYWluY29kZVBhdGgpO1xuICAgIGluc3RhbGxlZE9uQWdlbmN5T3JnID0gYXdhaXQgYWdlbmN5Q2xpZW50LmNoZWNrSW5zdGFsbGVkKFxuICAgICAgY29uZmlnLmNoYWluY29kZUlkLCBjb25maWcuY2hhaW5jb2RlVmVyc2lvbiwgY29uZmlnLmNoYWluY29kZVBhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5sb2coJ0ZhdGFsIGVycm9yIGdldHRpbmcgaW5zdGFsbGF0aW9uIHN0YXR1cyBvZiB0aGUgY2hhaW5jb2RlIScpO1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgtMSk7XG4gIH1cbiAgXG4gIGlmICghKGluc3RhbGxlZE9uUmV2aWV3ZXJPcmcgJiYgaW5zdGFsbGVkT25BZ2VuY3lPcmcpKSB7XG4gICAgY29uc29sZS5sb2coJ0NoYWluY29kZSBpcyBub3QgaW5zdGFsbGVkLCBhdHRlbXB0aW5nIGluc3RhbGxhdGlvbi4uLicpO1xuICAgIC8vIFB1bGwgY2hhaW5jb2RlIGVudmlyb25tZW50IGJhc2UgaW1hZ2VcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZ2V0QWRtaW5PcmdzKCk7XG4gICAgICBjb25zdCBzb2NrZXRQYXRoID0gcHJvY2Vzcy5lbnYuRE9DS0VSX1NPQ0tFVF9QQVRIIHx8XG4gICAgICAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/ICcvLy4vcGlwZS9kb2NrZXJfZW5naW5lJyA6ICcvdmFyL3J1bi9kb2NrZXIuc29jaycpO1xuICAgICAgY29uc3QgY2NlbnZJbWFnZSA9IHByb2Nlc3MuZW52LkRPQ0tFUl9DQ0VOVl9JTUFHRSB8fFxuICAgICAgICAnaHlwZXJsZWRnZXIvZmFicmljLWNjZW52Ong4Nl82NC0xLjAuMic7XG4gICAgICBjb25zdCBsaXN0T3B0cyA9IHsgc29ja2V0UGF0aCwgbWV0aG9kOiAnR0VUJywgcGF0aDogJy9pbWFnZXMvanNvbicgfTtcbiAgICAgIGNvbnN0IHB1bGxPcHRzID0ge1xuICAgICAgICBzb2NrZXRQYXRoLCBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0aDogdXJsLmZvcm1hdCh7IHBhdGhuYW1lOiAnL2ltYWdlcy9jcmVhdGUnLCBxdWVyeTogeyBmcm9tSW1hZ2U6IGNjZW52SW1hZ2UgfSB9KVxuICAgICAgfTtcblxuICAgICAgY29uc3QgaW1hZ2VzID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZXEgPSBodHRwLnJlcXVlc3QobGlzdE9wdHMsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGxldCBkYXRhID0gJyc7XG4gICAgICAgICAgcmVzcG9uc2Uuc2V0RW5jb2RpbmcoJ3V0Zi04Jyk7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBjaHVuayA9PiB7IGRhdGEgKz0gY2h1bms7IH0pO1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCAoKSA9PiB7IHJlc29sdmUoSlNPTi5wYXJzZShkYXRhKSk7IH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVxLm9uKCdlcnJvcicsIHJlamVjdCk7IHJlcS5lbmQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBpbWFnZUV4aXN0cyA9IGltYWdlcy5zb21lKFxuICAgICAgICBpID0+IGkuUmVwb1RhZ3MgJiYgaS5SZXBvVGFncy5zb21lKHRhZyA9PiB0YWcgPT09IGNjZW52SW1hZ2UpKTtcbiAgICAgIGlmICghaW1hZ2VFeGlzdHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Jhc2UgY29udGFpbmVyIGltYWdlIG5vdCBwcmVzZW50LCBwdWxsaW5nIGZyb20gRG9ja2VyIEh1Yi4uLicpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVxID0gaHR0cC5yZXF1ZXN0KHB1bGxPcHRzLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJlc3BvbnNlLm9uKCdkYXRhJywgKCkgPT4geyB9KTtcbiAgICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCAoKSA9PiB7IHJlc29sdmUoKTsgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVxLm9uKCdlcnJvcicsIHJlamVjdCk7IHJlcS5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCYXNlIGNvbnRhaW5lciBpbWFnZSBkb3dubG9hZGVkLicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Jhc2UgY29udGFpbmVyIGltYWdlIHByZXNlbnQuJyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coJ0ZhdGFsIGVycm9yIHB1bGxpbmcgZG9ja2VyIGltYWdlcy4nKTtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgcHJvY2Vzcy5leGl0KC0xKTtcbiAgICB9XG4gICAgLy8gSW5zdGFsbCBjaGFpbmNvZGVcbiAgICBjb25zdCBpbnN0YWxsYXRpb25Qcm9taXNlcyA9IFtcbiAgICAgIHJldmlld2VyQ2xpZW50Lmluc3RhbGwoXG4gICAgICAgIGNvbmZpZy5jaGFpbmNvZGVJZCwgY29uZmlnLmNoYWluY29kZVZlcnNpb24sIGNvbmZpZy5jaGFpbmNvZGVQYXRoKSxcbiAgICAgIGFnZW5jeUNsaWVudC5pbnN0YWxsKFxuXHRjb25maWcuY2hhaW5jb2RlSWQsIGNvbmZpZy5jaGFpbmNvZGVWZXJzaW9uLCBjb25maWcuY2hhaW5jb2RlUGF0aClcbiAgICBdO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChpbnN0YWxsYXRpb25Qcm9taXNlcyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgICBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAwKTsgfSk7XG4gICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IGluc3RhbGxlZCBjaGFpbmNvZGUgb24gdGhlIGRlZmF1bHQgY2hhbm5lbC4nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZygnRmF0YWwgZXJyb3IgaW5zdGFsbGluZyBjaGFpbmNvZGUgb24gdGhlIGRlZmF1bHQgY2hhbm5lbCEnKTtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgcHJvY2Vzcy5leGl0KC0xKTtcbiAgICB9XG4gICAgXG4gICAgLy8gSW5zdGFudGlhdGUgY2hhaW5jb2RlIG9uIGFsbCBwZWVyc1xuICAgIC8vIEluc3RhbnRpYXRpbmcgdGhlIGNoYWluY29kZSBvbiBhIHNpbmdsZSBwZWVyIHNob3VsZCBiZSBlbm91Z2ggKGZvciBub3cpXG4gICAgdHJ5IHtcbiAgICAgIC8vIEluaXRpYWwgY29udHJhY3QgdHlwZXNcbiAgICAgIGF3YWl0IHJldmlld2VyQ2xpZW50Lmluc3RhbnRpYXRlKGNvbmZpZy5jaGFpbmNvZGVJZCxcblx0Y29uZmlnLmNoYWluY29kZVZlcnNpb24pO1xuICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3NmdWxseSBpbnN0YW50aWF0ZWQgY2hhaW5jb2RlIG9uIGFsbCBwZWVycy4nKTtcbiAgICAgIHNldFN0YXR1cygncmVhZHknKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZygnRmF0YWwgZXJyb3IgaW5zdGFudGlhdGluZyBjaGFpbmNvZGUgb24gc29tZShhbGwpIHBlZXJzIScpO1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBwcm9jZXNzLmV4aXQoLTEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhaW5jb2RlIGFscmVhZHkgaW5zdGFsbGVkIG9uIHRoZSBibG9ja2NoYWluIG5ldHdvcmsuJyk7XG4gICAgc2V0U3RhdHVzKCdyZWFkeScpO1xuICB9XG59KSgpO1xuXG4vLyBFeHBvcnQgb3JnYW5pemF0aW9uIGNsaWVudHNcbmV4cG9ydCB7XG4gIHJldmlld2VyQ2xpZW50LFxuICBhZ2VuY3lDbGllbnRcbn07XG4iXX0=