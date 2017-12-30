'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OrganizationClient = undefined;

/**
 * Enrolls a user with the respective CA.
 *
 * @export
 * @param {string} client
 * @param {string} enrollmentID
 * @param {string} enrollmentSecret
 * @param {object} { url, mspId }
 * @returns the User object
 */
let getSubmitter = (() => {
  var _ref = _asyncToGenerator(function* (client, enrollmentID, enrollmentSecret, {
    url,
    mspId
  }) {

    try {
      let user = yield client.getUserContext(enrollmentID, true);
      if (user && user.isEnrolled()) {
        return user;
      }

      // Need to enroll with CA server
      const ca = new _fabricCaClient2.default(url, {
        verify: false
      });
      try {
        const enrollment = yield ca.enroll({
          enrollmentID,
          enrollmentSecret
        });
        user = new _User2.default(enrollmentID, client);
        yield user.setEnrollment(enrollment.key, enrollment.certificate, mspId);
        yield client.setUserContext(user);
        return user;
      } catch (e) {
        throw new Error(`Failed to enroll and persist User. Error: ${e.message}`);
      }
    } catch (e) {
      throw new Error(`Could not get UserContext! Error: ${e.message}`);
    }
  });

  return function getSubmitter(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.wrapError = wrapError;

var _path = require('path');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _grpc = require('grpc');

var _long = require('long');

var _long2 = _interopRequireDefault(_long);

var _fabricClient = require('fabric-client');

var _fabricClient2 = _interopRequireDefault(_fabricClient);

var _utils = require('fabric-client/lib/utils');

var _utils2 = _interopRequireDefault(_utils);

var _Orderer = require('fabric-client/lib/Orderer');

var _Orderer2 = _interopRequireDefault(_Orderer);

var _Peer = require('fabric-client/lib/Peer');

var _Peer2 = _interopRequireDefault(_Peer);

var _EventHub = require('fabric-client/lib/EventHub');

var _EventHub2 = _interopRequireDefault(_EventHub);

var _User = require('fabric-client/lib/User');

var _User2 = _interopRequireDefault(_User);

var _fabricCaClient = require('fabric-ca-client');

var _fabricCaClient2 = _interopRequireDefault(_fabricCaClient);

var _jsonStyleConverter = require('json-style-converter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

process.env.GOPATH = (0, _path.resolve)(__dirname, '../../chaincode');
const JOIN_TIMEOUT = 120000,
      TRANSACTION_TIMEOUT = 120000;

class OrganizationClient extends _events2.default {

  constructor(channelName, ordererConfig, peerConfig, caConfig, admin) {
    super();
    this._channelName = channelName;
    this._ordererConfig = ordererConfig;
    this._peerConfig = peerConfig;
    this._caConfig = caConfig;
    this._admin = admin;
    this._peers = [];
    this._eventHubs = [];
    this._client = new _fabricClient2.default();

    // Setup channel
    this._channel = this._client.newChannel(channelName);

    // Setup orderer and peers
    const orderer = this._client.newOrderer(ordererConfig.url, {
      pem: ordererConfig.pem,
      'ssl-target-name-override': ordererConfig.hostname
    });
    this._channel.addOrderer(orderer);

    const defaultPeer = this._client.newPeer(peerConfig.url, {
      pem: peerConfig.pem,
      'ssl-target-name-override': peerConfig.hostname
    });
    this._peers.push(defaultPeer);
    this._channel.addPeer(defaultPeer);
    this._adminUser = null;
  }

  login() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        _this._client.setStateStore((yield _fabricClient2.default.newDefaultKeyValueStore({
          path: `./${_this._peerConfig.hostname}`
        })));
        _this._adminUser = yield getSubmitter(_this._client, "admin", "adminpw", _this._caConfig);
      } catch (e) {
        console.log(`Failed to enroll user. Error: ${e.message}`);
        throw e;
      }
    })();
  }

  initEventHubs() {
    // Setup event hubs
    try {
      const defaultEventHub = this._client.newEventHub();
      defaultEventHub.setPeerAddr(this._peerConfig.eventHubUrl, {
        pem: this._peerConfig.pem,
        'ssl-target-name-override': this._peerConfig.hostname
      });
      defaultEventHub.connect();
      defaultEventHub.registerBlockEvent(block => {
        this.emit('block', unmarshalBlock(block));
      });
      this._eventHubs.push(defaultEventHub);
    } catch (e) {
      console.log(`Failed to configure event hubs. Error ${e.message}`);
      throw e;
    }
  }

  getOrgAdmin() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2._client.createUser({
        username: `Admin@${_this2._peerConfig.hostname}`,
        mspid: _this2._caConfig.mspId,
        cryptoContent: {
          privateKeyPEM: _this2._admin.key,
          signedCertPEM: _this2._admin.cert
        }
      });
    })();
  }

  initialize() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this3._channel.initialize();
      } catch (e) {
        console.log(`Failed to initialize chain. Error: ${e.message}`);
        throw e;
      }
    })();
  }

  createChannel(envelope) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const txId = _this4._client.newTransactionID();
      const channelConfig = _this4._client.extractChannelConfig(envelope);
      const signature = _this4._client.signChannelConfig(channelConfig);
      const request = {
        name: _this4._channelName,
        orderer: _this4._channel.getOrderers()[0],
        config: channelConfig,
        signatures: [signature],
        txId
      };
      const response = yield _this4._client.createChannel(request);

      // Wait for 5sec to create channel
      yield new Promise(function (resolve) {
        setTimeout(resolve, 5000);
      });
      return response;
    })();
  }

  joinChannel() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      try {
        const genesisBlock = yield _this5._channel.getGenesisBlock({
          txId: _this5._client.newTransactionID()
        });
        const request = {
          targets: _this5._peers,
          txId: _this5._client.newTransactionID(),
          block: genesisBlock
        };
        const joinedChannelPromises = _this5._eventHubs.map(function (eh) {
          eh.connect();
          return new Promise(function (resolve, reject) {
            let blockRegistration;
            const cb = function (block) {
              clearTimeout(responseTimeout);
              eh.unregisterBlockEvent(blockRegistration);
              if (block.data.data.length === 1) {
                const channelHeader = block.data.data[0].payload.header.channel_header;
                if (channelHeader.channel_id === _this5._channelName) {
                  resolve();
                } else {
                  reject(new Error('Peer did not join an expected channel.'));
                }
              }
            };

            blockRegistration = eh.registerBlockEvent(cb);
            const responseTimeout = setTimeout(function () {
              eh.unregisterBlockEvent(blockRegistration);
              reject(new Error('Peer did not respond in a timely fashion!'));
            }, JOIN_TIMEOUT);
          });
        });

        const completedPromise = joinedChannelPromises.concat([_this5._channel.joinChannel(request)]);
        yield Promise.all(completedPromise);
      } catch (e) {
        console.log(`Error joining peer to channel. Error: ${e.message}`);
        throw e;
      }
    })();
  }

  checkChannelMembership() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      try {
        const { channels } = yield _this6._client.queryChannels(_this6._peers[0]);
        if (!Array.isArray(channels)) {
          return false;
        }
        return channels.some(function ({ channel_id }) {
          return channel_id === _this6._channelName;
        });
      } catch (e) {
        return false;
      }
    })();
  }

  checkInstalled(chaincodeId, chaincodeVersion, chaincodePath) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      let {
        chaincodes
      } = yield _this7._channel.queryInstantiatedChaincodes();
      if (!Array.isArray(chaincodes)) {
        return false;
      }
      return chaincodes.some(function (cc) {
        return cc.name === chaincodeId && cc.path === chaincodePath && cc.version === chaincodeVersion;
      });
    })();
  }

  install(chaincodeId, chaincodeVersion, chaincodePath) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const request = {
        targets: _this8._peers,
        chaincodePath,
        chaincodeId,
        chaincodeVersion
      };

      // Make install proposal to all peers
      let results;
      try {
        results = yield _this8._client.installChaincode(request);
      } catch (e) {
        console.log(`Error sending install proposal to peer! Error: ${e.message}`);
        throw e;
      }
      const proposalResponses = results[0];
      const allGood = proposalResponses.every(function (pr) {
        return pr.response && pr.response.status == 200;
      });
      return allGood;
    })();
  }

  instantiate(chaincodeId, chaincodeVersion, ...args) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      let proposalResponses, proposal;
      const txId = _this9._client.newTransactionID();
      try {
        const request = {
          chaincodeType: 'golang',
          chaincodeId,
          chaincodeVersion,
          fcn: 'init',
          args: marshalArgs(args),
          txId
        };
        const results = yield _this9._channel.sendInstantiateProposal(request);
        proposalResponses = results[0];
        proposal = results[1];

        let allGood = proposalResponses.every(function (pr) {
          return pr.response && pr.response.status == 200;
        });

        if (!allGood) {
          throw new Error(`Proposal rejected by some (all) of the peers: ${proposalResponses}`);
        }
      } catch (e) {
        throw e;
      }

      try {
        const request = {
          proposalResponses,
          proposal
        };
        const deployId = txId.getTransactionID();
        const transactionCompletePromises = _this9._eventHubs.map(function (eh) {
          eh.connect();

          return new Promise(function (resolve, reject) {
            // Set timeout for the transaction response from the current peer
            const responseTimeout = setTimeout(function () {
              eh.unregisterTxEvent(deployId);
              reject(new Error('Peer did not respond in a timely fashion!'));
            }, TRANSACTION_TIMEOUT);

            eh.registerTxEvent(deployId, function (tx, code) {
              clearTimeout(responseTimeout);
              eh.unregisterTxEvent(deployId);
              if (code != 'VALID') {
                reject(new Error(`Peer has rejected transaction with code: ${code}`));
              } else {
                resolve();
              }
            });
          });
        });

        transactionCompletePromises.push(_this9._channel.sendTransaction(request));
        yield transactionCompletePromises;
      } catch (e) {
        throw e;
      }
    })();
  }

  invoke(chaincodeId, chaincodeVersion, fcn, ...args) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      let proposalResponses, proposal;
      const txId = _this10._client.newTransactionID();
      try {
        const request = {
          chaincodeId,
          chaincodeVersion,
          fcn,
          args: marshalArgs(args),
          txId
        };
        const results = yield _this10._channel.sendTransactionProposal(request);
        proposalResponses = results[0];
        proposal = results[1];

        const allGood = proposalResponses.every(function (pr) {
          return pr.response && pr.response.status == 200;
        });

        if (!allGood) {
          throw new Error(`Proposal rejected by some (all) of the peers: ${proposalResponses}`);
        }
      } catch (e) {
        throw e;
      }

      try {
        const request = {
          proposalResponses,
          proposal
        };

        const transactionId = txId.getTransactionID();
        const transactionCompletePromises = _this10._eventHubs.map(function (eh) {
          eh.connect();

          return new Promise(function (resolve, reject) {
            // Set timeout for the transaction response from the current peer
            const responseTimeout = setTimeout(function () {
              eh.unregisterTxEvent(transactionId);
              reject(new Error('Peer did not respond in a timely fashion!'));
            }, TRANSACTION_TIMEOUT);

            eh.registerTxEvent(transactionId, function (tx, code) {
              clearTimeout(responseTimeout);
              eh.unregisterTxEvent(transactionId);
              if (code != 'VALID') {
                reject(new Error(`Peer has rejected transaction with code: ${code}`));
              } else {
                resolve();
              }
            });
          });
        });

        transactionCompletePromises.push(_this10._channel.sendTransaction(request));
        try {
          yield transactionCompletePromises;
          const payload = proposalResponses[0].response.payload;
          return unmarshalResult([payload]);
        } catch (e) {
          throw e;
        }
      } catch (e) {
        throw e;
      }
    })();
  }

  query(chaincodeId, chaincodeVersion, fcn, ...args) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const request = {
        chaincodeId,
        chaincodeVersion,
        fcn,
        args: marshalArgs(args),
        txId: _this11._client.newTransactionID()
      };
      return unmarshalResult((yield _this11._channel.queryByChaincode(request)));
    })();
  }

  getBlocks(noOfLastBlocks) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      if (typeof noOfLastBlocks !== 'number' && typeof noOfLastBlocks !== 'string') {
        return [];
      }

      const {
        height
      } = yield _this12._channel.queryInfo();
      let blockCount;
      if (height.comp(noOfLastBlocks) > 0) {
        blockCount = noOfLastBlocks;
      } else {
        blockCount = height;
      }
      if (typeof blockCount === 'number') {
        blockCount = _long2.default.fromNumber(blockCount, height.unsigned);
      } else if (typeof blockCount === 'string') {
        blockCount = _long2.default.fromString(blockCount, height.unsigned);
      }
      blockCount = blockCount.toNumber();
      const queryBlock = _this12._channel.queryBlock.bind(_this12._channel);
      const blockPromises = {};
      blockPromises[Symbol.iterator] = function* () {
        for (let i = 1; i <= blockCount; i++) {
          yield queryBlock(height.sub(i).toNumber());
        }
      };
      const blocks = yield Promise.all([...blockPromises]);
      return blocks.map(unmarshalBlock);
    })();
  }
}exports.OrganizationClient = OrganizationClient;
function wrapError(message, innerError) {
  let error = new Error(message);
  error.inner = innerError;
  console.log(error.message);
  throw error;
}

function marshalArgs(args) {
  if (!args) {
    return args;
  }

  if (typeof args === 'string') {
    return [args];
  }

  let snakeArgs = (0, _jsonStyleConverter.camelToSnakeCase)(args);

  if (Array.isArray(args)) {
    return snakeArgs.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(snakeArgs)];
  }
}

function unmarshalResult(result) {
  if (!Array.isArray(result)) {
    return result;
  }
  let buff = Buffer.concat(result);
  if (!Buffer.isBuffer(buff)) {
    return result;
  }
  let json = buff.toString('utf8');
  if (!json) {
    return null;
  }
  let obj = JSON.parse(json);
  return (0, _jsonStyleConverter.snakeToCamelCase)(obj);
}

function unmarshalBlock(block) {
  const transactions = Array.isArray(block.data.data) ? block.data.data.map(({
    payload: {
      header,
      data
    }
  }) => {
    const {
      channel_header
    } = header;
    const {
      type,
      timestamp,
      epoch
    } = channel_header;
    return {
      type,
      timestamp
    };
  }) : [];
  return {
    id: block.header.number.toString(),
    fingerprint: block.header.data_hash.slice(0, 20),
    transactions
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9ibG9ja2NoYWluL3V0aWxzLmpzIl0sIm5hbWVzIjpbImNsaWVudCIsImVucm9sbG1lbnRJRCIsImVucm9sbG1lbnRTZWNyZXQiLCJ1cmwiLCJtc3BJZCIsInVzZXIiLCJnZXRVc2VyQ29udGV4dCIsImlzRW5yb2xsZWQiLCJjYSIsInZlcmlmeSIsImVucm9sbG1lbnQiLCJlbnJvbGwiLCJzZXRFbnJvbGxtZW50Iiwia2V5IiwiY2VydGlmaWNhdGUiLCJzZXRVc2VyQ29udGV4dCIsImUiLCJFcnJvciIsIm1lc3NhZ2UiLCJnZXRTdWJtaXR0ZXIiLCJ3cmFwRXJyb3IiLCJwcm9jZXNzIiwiZW52IiwiR09QQVRIIiwiX19kaXJuYW1lIiwiSk9JTl9USU1FT1VUIiwiVFJBTlNBQ1RJT05fVElNRU9VVCIsIk9yZ2FuaXphdGlvbkNsaWVudCIsImNvbnN0cnVjdG9yIiwiY2hhbm5lbE5hbWUiLCJvcmRlcmVyQ29uZmlnIiwicGVlckNvbmZpZyIsImNhQ29uZmlnIiwiYWRtaW4iLCJfY2hhbm5lbE5hbWUiLCJfb3JkZXJlckNvbmZpZyIsIl9wZWVyQ29uZmlnIiwiX2NhQ29uZmlnIiwiX2FkbWluIiwiX3BlZXJzIiwiX2V2ZW50SHVicyIsIl9jbGllbnQiLCJfY2hhbm5lbCIsIm5ld0NoYW5uZWwiLCJvcmRlcmVyIiwibmV3T3JkZXJlciIsInBlbSIsImhvc3RuYW1lIiwiYWRkT3JkZXJlciIsImRlZmF1bHRQZWVyIiwibmV3UGVlciIsInB1c2giLCJhZGRQZWVyIiwiX2FkbWluVXNlciIsImxvZ2luIiwic2V0U3RhdGVTdG9yZSIsIm5ld0RlZmF1bHRLZXlWYWx1ZVN0b3JlIiwicGF0aCIsImNvbnNvbGUiLCJsb2ciLCJpbml0RXZlbnRIdWJzIiwiZGVmYXVsdEV2ZW50SHViIiwibmV3RXZlbnRIdWIiLCJzZXRQZWVyQWRkciIsImV2ZW50SHViVXJsIiwiY29ubmVjdCIsInJlZ2lzdGVyQmxvY2tFdmVudCIsImJsb2NrIiwiZW1pdCIsInVubWFyc2hhbEJsb2NrIiwiZ2V0T3JnQWRtaW4iLCJjcmVhdGVVc2VyIiwidXNlcm5hbWUiLCJtc3BpZCIsImNyeXB0b0NvbnRlbnQiLCJwcml2YXRlS2V5UEVNIiwic2lnbmVkQ2VydFBFTSIsImNlcnQiLCJpbml0aWFsaXplIiwiY3JlYXRlQ2hhbm5lbCIsImVudmVsb3BlIiwidHhJZCIsIm5ld1RyYW5zYWN0aW9uSUQiLCJjaGFubmVsQ29uZmlnIiwiZXh0cmFjdENoYW5uZWxDb25maWciLCJzaWduYXR1cmUiLCJzaWduQ2hhbm5lbENvbmZpZyIsInJlcXVlc3QiLCJuYW1lIiwiZ2V0T3JkZXJlcnMiLCJjb25maWciLCJzaWduYXR1cmVzIiwicmVzcG9uc2UiLCJQcm9taXNlIiwic2V0VGltZW91dCIsInJlc29sdmUiLCJqb2luQ2hhbm5lbCIsImdlbmVzaXNCbG9jayIsImdldEdlbmVzaXNCbG9jayIsInRhcmdldHMiLCJqb2luZWRDaGFubmVsUHJvbWlzZXMiLCJtYXAiLCJlaCIsInJlamVjdCIsImJsb2NrUmVnaXN0cmF0aW9uIiwiY2IiLCJjbGVhclRpbWVvdXQiLCJyZXNwb25zZVRpbWVvdXQiLCJ1bnJlZ2lzdGVyQmxvY2tFdmVudCIsImRhdGEiLCJsZW5ndGgiLCJjaGFubmVsSGVhZGVyIiwicGF5bG9hZCIsImhlYWRlciIsImNoYW5uZWxfaGVhZGVyIiwiY2hhbm5lbF9pZCIsImNvbXBsZXRlZFByb21pc2UiLCJjb25jYXQiLCJhbGwiLCJjaGVja0NoYW5uZWxNZW1iZXJzaGlwIiwiY2hhbm5lbHMiLCJxdWVyeUNoYW5uZWxzIiwiQXJyYXkiLCJpc0FycmF5Iiwic29tZSIsImNoZWNrSW5zdGFsbGVkIiwiY2hhaW5jb2RlSWQiLCJjaGFpbmNvZGVWZXJzaW9uIiwiY2hhaW5jb2RlUGF0aCIsImNoYWluY29kZXMiLCJxdWVyeUluc3RhbnRpYXRlZENoYWluY29kZXMiLCJjYyIsInZlcnNpb24iLCJpbnN0YWxsIiwicmVzdWx0cyIsImluc3RhbGxDaGFpbmNvZGUiLCJwcm9wb3NhbFJlc3BvbnNlcyIsImFsbEdvb2QiLCJldmVyeSIsInByIiwic3RhdHVzIiwiaW5zdGFudGlhdGUiLCJhcmdzIiwicHJvcG9zYWwiLCJjaGFpbmNvZGVUeXBlIiwiZmNuIiwibWFyc2hhbEFyZ3MiLCJzZW5kSW5zdGFudGlhdGVQcm9wb3NhbCIsImRlcGxveUlkIiwiZ2V0VHJhbnNhY3Rpb25JRCIsInRyYW5zYWN0aW9uQ29tcGxldGVQcm9taXNlcyIsInVucmVnaXN0ZXJUeEV2ZW50IiwicmVnaXN0ZXJUeEV2ZW50IiwidHgiLCJjb2RlIiwic2VuZFRyYW5zYWN0aW9uIiwiaW52b2tlIiwic2VuZFRyYW5zYWN0aW9uUHJvcG9zYWwiLCJ0cmFuc2FjdGlvbklkIiwidW5tYXJzaGFsUmVzdWx0IiwicXVlcnkiLCJxdWVyeUJ5Q2hhaW5jb2RlIiwiZ2V0QmxvY2tzIiwibm9PZkxhc3RCbG9ja3MiLCJoZWlnaHQiLCJxdWVyeUluZm8iLCJibG9ja0NvdW50IiwiY29tcCIsImZyb21OdW1iZXIiLCJ1bnNpZ25lZCIsImZyb21TdHJpbmciLCJ0b051bWJlciIsInF1ZXJ5QmxvY2siLCJiaW5kIiwiYmxvY2tQcm9taXNlcyIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiaSIsInN1YiIsImJsb2NrcyIsImlubmVyRXJyb3IiLCJlcnJvciIsImlubmVyIiwic25ha2VBcmdzIiwiYXJnIiwiSlNPTiIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwicmVzdWx0IiwiYnVmZiIsIkJ1ZmZlciIsImlzQnVmZmVyIiwianNvbiIsIm9iaiIsInBhcnNlIiwidHJhbnNhY3Rpb25zIiwidHlwZSIsInRpbWVzdGFtcCIsImVwb2NoIiwiaWQiLCJudW1iZXIiLCJmaW5nZXJwcmludCIsImRhdGFfaGFzaCIsInNsaWNlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQW1aQTs7Ozs7Ozs7Ozs7K0JBVUEsV0FDRUEsTUFERixFQUNVQyxZQURWLEVBQ3dCQyxnQkFEeEIsRUFDMEM7QUFDdENDLE9BRHNDO0FBRXRDQztBQUZzQyxHQUQxQyxFQUlLOztBQUVI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RE87QUFFUEo7QUFGTztBQURVLEdBQUQsS0FLZDtBQUNKLFVBQU07QUFDSks7QUFESSxRQUVGRCxNQUZKO0FBR0EsVUFBTTtBQUNKbUYsVUFESTtBQUVKQyxlQUZJO0FBR0pDO0FBSEksUUFJRnBGLGNBSko7QUFLQSxXQUFPO0FBQ0xrRixVQURLO0FBRUxDO0FBRkssS0FBUDtBQUlELEdBbEJELENBRG1CLEdBbUJkLEVBbkJQO0FBb0JBLFNBQU87QUFDTEUsUUFBSXBJLE1BQU04QyxNQUFOLENBQWF1RixNQUFiLENBQW9CYixRQUFwQixFQURDO0FBRUxjLGlCQUFhdEksTUFBTThDLE1BQU4sQ0FBYXlGLFNBQWIsQ0FBdUJDLEtBQXZCLENBQTZCLENBQTdCLEVBQWdDLEVBQWhDLENBRlI7QUFHTFI7QUFISyxHQUFQO0FBS0QiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7XG4gIHJlc29sdmVcbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB7XG4gIGxvYWQgYXMgbG9hZFByb3RvXG59IGZyb20gJ2dycGMnO1xuaW1wb3J0IExvbmcgZnJvbSAnbG9uZyc7XG5pbXBvcnQgaGZjIGZyb20gJ2ZhYnJpYy1jbGllbnQnO1xuaW1wb3J0IHV0aWxzIGZyb20gJ2ZhYnJpYy1jbGllbnQvbGliL3V0aWxzJztcbmltcG9ydCBPcmRlcmVyIGZyb20gJ2ZhYnJpYy1jbGllbnQvbGliL09yZGVyZXInO1xuaW1wb3J0IFBlZXIgZnJvbSAnZmFicmljLWNsaWVudC9saWIvUGVlcic7XG5pbXBvcnQgRXZlbnRIdWIgZnJvbSAnZmFicmljLWNsaWVudC9saWIvRXZlbnRIdWInO1xuaW1wb3J0IFVzZXIgZnJvbSAnZmFicmljLWNsaWVudC9saWIvVXNlcic7XG5pbXBvcnQgQ0FDbGllbnQgZnJvbSAnZmFicmljLWNhLWNsaWVudCc7XG5pbXBvcnQge1xuICBzbmFrZVRvQ2FtZWxDYXNlLFxuICBjYW1lbFRvU25ha2VDYXNlXG59IGZyb20gJ2pzb24tc3R5bGUtY29udmVydGVyJztcblxucHJvY2Vzcy5lbnYuR09QQVRIID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9jaGFpbmNvZGUnKTtcbmNvbnN0IEpPSU5fVElNRU9VVCA9IDEyMDAwMCxcbiAgVFJBTlNBQ1RJT05fVElNRU9VVCA9IDEyMDAwMDtcblxuZXhwb3J0IGNsYXNzIE9yZ2FuaXphdGlvbkNsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoY2hhbm5lbE5hbWUsIG9yZGVyZXJDb25maWcsIHBlZXJDb25maWcsIGNhQ29uZmlnLCBhZG1pbikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fY2hhbm5lbE5hbWUgPSBjaGFubmVsTmFtZTtcbiAgICB0aGlzLl9vcmRlcmVyQ29uZmlnID0gb3JkZXJlckNvbmZpZztcbiAgICB0aGlzLl9wZWVyQ29uZmlnID0gcGVlckNvbmZpZztcbiAgICB0aGlzLl9jYUNvbmZpZyA9IGNhQ29uZmlnO1xuICAgIHRoaXMuX2FkbWluID0gYWRtaW47XG4gICAgdGhpcy5fcGVlcnMgPSBbXTtcbiAgICB0aGlzLl9ldmVudEh1YnMgPSBbXTtcbiAgICB0aGlzLl9jbGllbnQgPSBuZXcgaGZjKCk7XG5cbiAgICAvLyBTZXR1cCBjaGFubmVsXG4gICAgdGhpcy5fY2hhbm5lbCA9IHRoaXMuX2NsaWVudC5uZXdDaGFubmVsKGNoYW5uZWxOYW1lKTtcblxuICAgIC8vIFNldHVwIG9yZGVyZXIgYW5kIHBlZXJzXG4gICAgY29uc3Qgb3JkZXJlciA9IHRoaXMuX2NsaWVudC5uZXdPcmRlcmVyKG9yZGVyZXJDb25maWcudXJsLCB7XG4gICAgICBwZW06IG9yZGVyZXJDb25maWcucGVtLFxuICAgICAgJ3NzbC10YXJnZXQtbmFtZS1vdmVycmlkZSc6IG9yZGVyZXJDb25maWcuaG9zdG5hbWVcbiAgICB9KTtcbiAgICB0aGlzLl9jaGFubmVsLmFkZE9yZGVyZXIob3JkZXJlcik7XG5cbiAgICBjb25zdCBkZWZhdWx0UGVlciA9IHRoaXMuX2NsaWVudC5uZXdQZWVyKHBlZXJDb25maWcudXJsLCB7XG4gICAgICBwZW06IHBlZXJDb25maWcucGVtLFxuICAgICAgJ3NzbC10YXJnZXQtbmFtZS1vdmVycmlkZSc6IHBlZXJDb25maWcuaG9zdG5hbWVcbiAgICB9KTtcbiAgICB0aGlzLl9wZWVycy5wdXNoKGRlZmF1bHRQZWVyKTtcbiAgICB0aGlzLl9jaGFubmVsLmFkZFBlZXIoZGVmYXVsdFBlZXIpO1xuICAgIHRoaXMuX2FkbWluVXNlciA9IG51bGw7XG4gIH1cblxuICBhc3luYyBsb2dpbigpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fY2xpZW50LnNldFN0YXRlU3RvcmUoXG4gICAgICAgIGF3YWl0IGhmYy5uZXdEZWZhdWx0S2V5VmFsdWVTdG9yZSh7XG4gICAgICAgICAgcGF0aDogYC4vJHt0aGlzLl9wZWVyQ29uZmlnLmhvc3RuYW1lfWBcbiAgICAgICAgfSkpO1xuICAgICAgdGhpcy5fYWRtaW5Vc2VyID0gYXdhaXQgZ2V0U3VibWl0dGVyKFxuICAgICAgICB0aGlzLl9jbGllbnQsIFwiYWRtaW5cIiwgXCJhZG1pbnB3XCIsIHRoaXMuX2NhQ29uZmlnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRmFpbGVkIHRvIGVucm9sbCB1c2VyLiBFcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGluaXRFdmVudEh1YnMoKSB7XG4gICAgLy8gU2V0dXAgZXZlbnQgaHVic1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZhdWx0RXZlbnRIdWIgPSB0aGlzLl9jbGllbnQubmV3RXZlbnRIdWIoKTtcbiAgICAgIGRlZmF1bHRFdmVudEh1Yi5zZXRQZWVyQWRkcih0aGlzLl9wZWVyQ29uZmlnLmV2ZW50SHViVXJsLCB7XG4gICAgICAgIHBlbTogdGhpcy5fcGVlckNvbmZpZy5wZW0sXG4gICAgICAgICdzc2wtdGFyZ2V0LW5hbWUtb3ZlcnJpZGUnOiB0aGlzLl9wZWVyQ29uZmlnLmhvc3RuYW1lXG4gICAgICB9KTtcbiAgICAgIGRlZmF1bHRFdmVudEh1Yi5jb25uZWN0KCk7XG4gICAgICBkZWZhdWx0RXZlbnRIdWIucmVnaXN0ZXJCbG9ja0V2ZW50KFxuICAgICAgICBibG9jayA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdibG9jaycsIHVubWFyc2hhbEJsb2NrKGJsb2NrKSk7XG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fZXZlbnRIdWJzLnB1c2goZGVmYXVsdEV2ZW50SHViKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRmFpbGVkIHRvIGNvbmZpZ3VyZSBldmVudCBodWJzLiBFcnJvciAke2UubWVzc2FnZX1gKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0T3JnQWRtaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5jcmVhdGVVc2VyKHtcbiAgICAgIHVzZXJuYW1lOiBgQWRtaW5AJHt0aGlzLl9wZWVyQ29uZmlnLmhvc3RuYW1lfWAsXG4gICAgICBtc3BpZDogdGhpcy5fY2FDb25maWcubXNwSWQsXG4gICAgICBjcnlwdG9Db250ZW50OiB7XG4gICAgICAgIHByaXZhdGVLZXlQRU06IHRoaXMuX2FkbWluLmtleSxcbiAgICAgICAgc2lnbmVkQ2VydFBFTTogdGhpcy5fYWRtaW4uY2VydFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fY2hhbm5lbC5pbml0aWFsaXplKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coYEZhaWxlZCB0byBpbml0aWFsaXplIGNoYWluLiBFcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUNoYW5uZWwoZW52ZWxvcGUpIHtcbiAgICBjb25zdCB0eElkID0gdGhpcy5fY2xpZW50Lm5ld1RyYW5zYWN0aW9uSUQoKTtcbiAgICBjb25zdCBjaGFubmVsQ29uZmlnID0gdGhpcy5fY2xpZW50LmV4dHJhY3RDaGFubmVsQ29uZmlnKGVudmVsb3BlKTtcbiAgICBjb25zdCBzaWduYXR1cmUgPSB0aGlzLl9jbGllbnQuc2lnbkNoYW5uZWxDb25maWcoY2hhbm5lbENvbmZpZyk7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgIG5hbWU6IHRoaXMuX2NoYW5uZWxOYW1lLFxuICAgICAgb3JkZXJlcjogdGhpcy5fY2hhbm5lbC5nZXRPcmRlcmVycygpWzBdLFxuICAgICAgY29uZmlnOiBjaGFubmVsQ29uZmlnLFxuICAgICAgc2lnbmF0dXJlczogW3NpZ25hdHVyZV0sXG4gICAgICB0eElkXG4gICAgfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NsaWVudC5jcmVhdGVDaGFubmVsKHJlcXVlc3QpO1xuXG4gICAgLy8gV2FpdCBmb3IgNXNlYyB0byBjcmVhdGUgY2hhbm5lbFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2V0VGltZW91dChyZXNvbHZlLCA1MDAwKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICBhc3luYyBqb2luQ2hhbm5lbCgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZ2VuZXNpc0Jsb2NrID0gYXdhaXQgdGhpcy5fY2hhbm5lbC5nZXRHZW5lc2lzQmxvY2soe1xuICAgICAgICB0eElkOiB0aGlzLl9jbGllbnQubmV3VHJhbnNhY3Rpb25JRCgpXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgIHRhcmdldHM6IHRoaXMuX3BlZXJzLFxuICAgICAgICB0eElkOiB0aGlzLl9jbGllbnQubmV3VHJhbnNhY3Rpb25JRCgpLFxuICAgICAgICBibG9jazogZ2VuZXNpc0Jsb2NrXG4gICAgICB9O1xuICAgICAgY29uc3Qgam9pbmVkQ2hhbm5lbFByb21pc2VzID0gdGhpcy5fZXZlbnRIdWJzLm1hcChlaCA9PiB7XG4gICAgICAgIGVoLmNvbm5lY3QoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBsZXQgYmxvY2tSZWdpc3RyYXRpb247XG4gICAgICAgICAgY29uc3QgY2IgPSBibG9jayA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQocmVzcG9uc2VUaW1lb3V0KTtcbiAgICAgICAgICAgIGVoLnVucmVnaXN0ZXJCbG9ja0V2ZW50KGJsb2NrUmVnaXN0cmF0aW9uKTtcbiAgICAgICAgICAgIGlmIChibG9jay5kYXRhLmRhdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNoYW5uZWxIZWFkZXIgPVxuICAgICAgICAgICAgICAgIGJsb2NrLmRhdGEuZGF0YVswXS5wYXlsb2FkLmhlYWRlci5jaGFubmVsX2hlYWRlcjtcbiAgICAgICAgICAgICAgaWYgKGNoYW5uZWxIZWFkZXIuY2hhbm5lbF9pZCA9PT0gdGhpcy5fY2hhbm5lbE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUGVlciBkaWQgbm90IGpvaW4gYW4gZXhwZWN0ZWQgY2hhbm5lbC4nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgYmxvY2tSZWdpc3RyYXRpb24gPSBlaC5yZWdpc3RlckJsb2NrRXZlbnQoY2IpO1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZWgudW5yZWdpc3RlckJsb2NrRXZlbnQoYmxvY2tSZWdpc3RyYXRpb24pO1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUGVlciBkaWQgbm90IHJlc3BvbmQgaW4gYSB0aW1lbHkgZmFzaGlvbiEnKSk7XG4gICAgICAgICAgfSwgSk9JTl9USU1FT1VUKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY29tcGxldGVkUHJvbWlzZSA9IGpvaW5lZENoYW5uZWxQcm9taXNlcy5jb25jYXQoW1xuICAgICAgICB0aGlzLl9jaGFubmVsLmpvaW5DaGFubmVsKHJlcXVlc3QpXG4gICAgICBdKTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGNvbXBsZXRlZFByb21pc2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBqb2luaW5nIHBlZXIgdG8gY2hhbm5lbC4gRXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0NoYW5uZWxNZW1iZXJzaGlwKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGNoYW5uZWxzIH0gPSBhd2FpdCB0aGlzLl9jbGllbnQucXVlcnlDaGFubmVscyh0aGlzLl9wZWVyc1swXSk7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hhbm5lbHMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFubmVscy5zb21lKCh7Y2hhbm5lbF9pZH0pID0+IGNoYW5uZWxfaWQgPT09IHRoaXMuX2NoYW5uZWxOYW1lKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2hlY2tJbnN0YWxsZWQoY2hhaW5jb2RlSWQsIGNoYWluY29kZVZlcnNpb24sIGNoYWluY29kZVBhdGgpIHtcbiAgICBsZXQge1xuICAgICAgY2hhaW5jb2Rlc1xuICAgIH0gPSBhd2FpdCB0aGlzLl9jaGFubmVsLnF1ZXJ5SW5zdGFudGlhdGVkQ2hhaW5jb2RlcygpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjaGFpbmNvZGVzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY2hhaW5jb2Rlcy5zb21lKGNjID0+XG4gICAgICBjYy5uYW1lID09PSBjaGFpbmNvZGVJZCAmJlxuICAgICAgY2MucGF0aCA9PT0gY2hhaW5jb2RlUGF0aCAmJlxuICAgICAgY2MudmVyc2lvbiA9PT0gY2hhaW5jb2RlVmVyc2lvbik7XG4gIH1cblxuICBhc3luYyBpbnN0YWxsKGNoYWluY29kZUlkLCBjaGFpbmNvZGVWZXJzaW9uLCBjaGFpbmNvZGVQYXRoKSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgIHRhcmdldHM6IHRoaXMuX3BlZXJzLFxuICAgICAgY2hhaW5jb2RlUGF0aCxcbiAgICAgIGNoYWluY29kZUlkLFxuICAgICAgY2hhaW5jb2RlVmVyc2lvblxuICAgIH07XG5cbiAgICAvLyBNYWtlIGluc3RhbGwgcHJvcG9zYWwgdG8gYWxsIHBlZXJzXG4gICAgbGV0IHJlc3VsdHM7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdHMgPSBhd2FpdCB0aGlzLl9jbGllbnQuaW5zdGFsbENoYWluY29kZShyZXF1ZXN0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYEVycm9yIHNlbmRpbmcgaW5zdGFsbCBwcm9wb3NhbCB0byBwZWVyISBFcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICBjb25zdCBwcm9wb3NhbFJlc3BvbnNlcyA9IHJlc3VsdHNbMF07XG4gICAgY29uc3QgYWxsR29vZCA9IHByb3Bvc2FsUmVzcG9uc2VzXG4gICAgICAuZXZlcnkocHIgPT4gcHIucmVzcG9uc2UgJiYgcHIucmVzcG9uc2Uuc3RhdHVzID09IDIwMCk7XG4gICAgcmV0dXJuIGFsbEdvb2Q7XG4gIH1cblxuICBhc3luYyBpbnN0YW50aWF0ZShjaGFpbmNvZGVJZCwgY2hhaW5jb2RlVmVyc2lvbiwgLi4uYXJncykge1xuICAgIGxldCBwcm9wb3NhbFJlc3BvbnNlcywgcHJvcG9zYWw7XG4gICAgY29uc3QgdHhJZCA9IHRoaXMuX2NsaWVudC5uZXdUcmFuc2FjdGlvbklEKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgIGNoYWluY29kZVR5cGU6ICdnb2xhbmcnLFxuICAgICAgICBjaGFpbmNvZGVJZCxcbiAgICAgICAgY2hhaW5jb2RlVmVyc2lvbixcbiAgICAgICAgZmNuOiAnaW5pdCcsXG4gICAgICAgIGFyZ3M6IG1hcnNoYWxBcmdzKGFyZ3MpLFxuICAgICAgICB0eElkXG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuX2NoYW5uZWwuc2VuZEluc3RhbnRpYXRlUHJvcG9zYWwocmVxdWVzdCk7XG4gICAgICBwcm9wb3NhbFJlc3BvbnNlcyA9IHJlc3VsdHNbMF07XG4gICAgICBwcm9wb3NhbCA9IHJlc3VsdHNbMV07XG5cbiAgICAgIGxldCBhbGxHb29kID0gcHJvcG9zYWxSZXNwb25zZXNcbiAgICAgICAgLmV2ZXJ5KHByID0+IHByLnJlc3BvbnNlICYmIHByLnJlc3BvbnNlLnN0YXR1cyA9PSAyMDApO1xuXG4gICAgICBpZiAoIWFsbEdvb2QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBQcm9wb3NhbCByZWplY3RlZCBieSBzb21lIChhbGwpIG9mIHRoZSBwZWVyczogJHtwcm9wb3NhbFJlc3BvbnNlc31gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICBwcm9wb3NhbFJlc3BvbnNlcyxcbiAgICAgICAgcHJvcG9zYWxcbiAgICAgIH07XG4gICAgICBjb25zdCBkZXBsb3lJZCA9IHR4SWQuZ2V0VHJhbnNhY3Rpb25JRCgpO1xuICAgICAgY29uc3QgdHJhbnNhY3Rpb25Db21wbGV0ZVByb21pc2VzID0gdGhpcy5fZXZlbnRIdWJzLm1hcChlaCA9PiB7XG4gICAgICAgIGVoLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIC8vIFNldCB0aW1lb3V0IGZvciB0aGUgdHJhbnNhY3Rpb24gcmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBwZWVyXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBlaC51bnJlZ2lzdGVyVHhFdmVudChkZXBsb3lJZCk7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdQZWVyIGRpZCBub3QgcmVzcG9uZCBpbiBhIHRpbWVseSBmYXNoaW9uIScpKTtcbiAgICAgICAgICB9LCBUUkFOU0FDVElPTl9USU1FT1VUKTtcblxuICAgICAgICAgIGVoLnJlZ2lzdGVyVHhFdmVudChkZXBsb3lJZCwgKHR4LCBjb2RlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQocmVzcG9uc2VUaW1lb3V0KTtcbiAgICAgICAgICAgIGVoLnVucmVnaXN0ZXJUeEV2ZW50KGRlcGxveUlkKTtcbiAgICAgICAgICAgIGlmIChjb2RlICE9ICdWQUxJRCcpIHtcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGVlciBoYXMgcmVqZWN0ZWQgdHJhbnNhY3Rpb24gd2l0aCBjb2RlOiAke2NvZGV9YCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0cmFuc2FjdGlvbkNvbXBsZXRlUHJvbWlzZXMucHVzaCh0aGlzLl9jaGFubmVsLnNlbmRUcmFuc2FjdGlvbihyZXF1ZXN0KSk7XG4gICAgICBhd2FpdCB0cmFuc2FjdGlvbkNvbXBsZXRlUHJvbWlzZXM7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBpbnZva2UoY2hhaW5jb2RlSWQsIGNoYWluY29kZVZlcnNpb24sIGZjbiwgLi4uYXJncykge1xuICAgIGxldCBwcm9wb3NhbFJlc3BvbnNlcywgcHJvcG9zYWw7XG4gICAgY29uc3QgdHhJZCA9IHRoaXMuX2NsaWVudC5uZXdUcmFuc2FjdGlvbklEKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgIGNoYWluY29kZUlkLFxuICAgICAgICBjaGFpbmNvZGVWZXJzaW9uLFxuICAgICAgICBmY24sXG4gICAgICAgIGFyZ3M6IG1hcnNoYWxBcmdzKGFyZ3MpLFxuICAgICAgICB0eElkXG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuX2NoYW5uZWwuc2VuZFRyYW5zYWN0aW9uUHJvcG9zYWwocmVxdWVzdCk7XG4gICAgICBwcm9wb3NhbFJlc3BvbnNlcyA9IHJlc3VsdHNbMF07XG4gICAgICBwcm9wb3NhbCA9IHJlc3VsdHNbMV07XG5cbiAgICAgIGNvbnN0IGFsbEdvb2QgPSBwcm9wb3NhbFJlc3BvbnNlc1xuICAgICAgICAuZXZlcnkocHIgPT4gcHIucmVzcG9uc2UgJiYgcHIucmVzcG9uc2Uuc3RhdHVzID09IDIwMCk7XG5cbiAgICAgIGlmICghYWxsR29vZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFByb3Bvc2FsIHJlamVjdGVkIGJ5IHNvbWUgKGFsbCkgb2YgdGhlIHBlZXJzOiAke3Byb3Bvc2FsUmVzcG9uc2VzfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgIHByb3Bvc2FsUmVzcG9uc2VzLFxuICAgICAgICBwcm9wb3NhbFxuICAgICAgfTtcblxuICAgICAgY29uc3QgdHJhbnNhY3Rpb25JZCA9IHR4SWQuZ2V0VHJhbnNhY3Rpb25JRCgpO1xuICAgICAgY29uc3QgdHJhbnNhY3Rpb25Db21wbGV0ZVByb21pc2VzID0gdGhpcy5fZXZlbnRIdWJzLm1hcChlaCA9PiB7XG4gICAgICAgIGVoLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIC8vIFNldCB0aW1lb3V0IGZvciB0aGUgdHJhbnNhY3Rpb24gcmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBwZWVyXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBlaC51bnJlZ2lzdGVyVHhFdmVudCh0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1BlZXIgZGlkIG5vdCByZXNwb25kIGluIGEgdGltZWx5IGZhc2hpb24hJykpO1xuICAgICAgICAgIH0sIFRSQU5TQUNUSU9OX1RJTUVPVVQpO1xuXG4gICAgICAgICAgZWgucmVnaXN0ZXJUeEV2ZW50KHRyYW5zYWN0aW9uSWQsICh0eCwgY29kZSkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHJlc3BvbnNlVGltZW91dCk7XG4gICAgICAgICAgICBlaC51bnJlZ2lzdGVyVHhFdmVudCh0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChjb2RlICE9ICdWQUxJRCcpIHtcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGVlciBoYXMgcmVqZWN0ZWQgdHJhbnNhY3Rpb24gd2l0aCBjb2RlOiAke2NvZGV9YCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0cmFuc2FjdGlvbkNvbXBsZXRlUHJvbWlzZXMucHVzaCh0aGlzLl9jaGFubmVsLnNlbmRUcmFuc2FjdGlvbihyZXF1ZXN0KSk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0cmFuc2FjdGlvbkNvbXBsZXRlUHJvbWlzZXM7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBwcm9wb3NhbFJlc3BvbnNlc1swXS5yZXNwb25zZS5wYXlsb2FkO1xuICAgICAgICByZXR1cm4gdW5tYXJzaGFsUmVzdWx0KFtwYXlsb2FkXSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBxdWVyeShjaGFpbmNvZGVJZCwgY2hhaW5jb2RlVmVyc2lvbiwgZmNuLCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgIGNoYWluY29kZUlkLFxuICAgICAgY2hhaW5jb2RlVmVyc2lvbixcbiAgICAgIGZjbixcbiAgICAgIGFyZ3M6IG1hcnNoYWxBcmdzKGFyZ3MpLFxuICAgICAgdHhJZDogdGhpcy5fY2xpZW50Lm5ld1RyYW5zYWN0aW9uSUQoKSxcbiAgICB9O1xuICAgIHJldHVybiB1bm1hcnNoYWxSZXN1bHQoYXdhaXQgdGhpcy5fY2hhbm5lbC5xdWVyeUJ5Q2hhaW5jb2RlKHJlcXVlc3QpKTtcbiAgfVxuXG4gIGFzeW5jIGdldEJsb2Nrcyhub09mTGFzdEJsb2Nrcykge1xuICAgIGlmICh0eXBlb2Ygbm9PZkxhc3RCbG9ja3MgIT09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2Ygbm9PZkxhc3RCbG9ja3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgaGVpZ2h0XG4gICAgfSA9IGF3YWl0IHRoaXMuX2NoYW5uZWwucXVlcnlJbmZvKCk7XG4gICAgbGV0IGJsb2NrQ291bnQ7XG4gICAgaWYgKGhlaWdodC5jb21wKG5vT2ZMYXN0QmxvY2tzKSA+IDApIHtcbiAgICAgIGJsb2NrQ291bnQgPSBub09mTGFzdEJsb2NrcztcbiAgICB9IGVsc2Uge1xuICAgICAgYmxvY2tDb3VudCA9IGhlaWdodDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBibG9ja0NvdW50ID09PSAnbnVtYmVyJykge1xuICAgICAgYmxvY2tDb3VudCA9IExvbmcuZnJvbU51bWJlcihibG9ja0NvdW50LCBoZWlnaHQudW5zaWduZWQpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGJsb2NrQ291bnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBibG9ja0NvdW50ID0gTG9uZy5mcm9tU3RyaW5nKGJsb2NrQ291bnQsIGhlaWdodC51bnNpZ25lZCk7XG4gICAgfVxuICAgIGJsb2NrQ291bnQgPSBibG9ja0NvdW50LnRvTnVtYmVyKCk7XG4gICAgY29uc3QgcXVlcnlCbG9jayA9IHRoaXMuX2NoYW5uZWwucXVlcnlCbG9jay5iaW5kKHRoaXMuX2NoYW5uZWwpO1xuICAgIGNvbnN0IGJsb2NrUHJvbWlzZXMgPSB7fTtcbiAgICBibG9ja1Byb21pc2VzW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiogKCkge1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gYmxvY2tDb3VudDsgaSsrKSB7XG4gICAgICAgIHlpZWxkIHF1ZXJ5QmxvY2soaGVpZ2h0LnN1YihpKS50b051bWJlcigpKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGJsb2NrcyA9IGF3YWl0IFByb21pc2UuYWxsKFsuLi5ibG9ja1Byb21pc2VzXSk7XG4gICAgcmV0dXJuIGJsb2Nrcy5tYXAodW5tYXJzaGFsQmxvY2spO1xuICB9XG59XG5cbi8qKlxuICogRW5yb2xscyBhIHVzZXIgd2l0aCB0aGUgcmVzcGVjdGl2ZSBDQS5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gZW5yb2xsbWVudElEXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5yb2xsbWVudFNlY3JldFxuICogQHBhcmFtIHtvYmplY3R9IHsgdXJsLCBtc3BJZCB9XG4gKiBAcmV0dXJucyB0aGUgVXNlciBvYmplY3RcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0U3VibWl0dGVyKFxuICBjbGllbnQsIGVucm9sbG1lbnRJRCwgZW5yb2xsbWVudFNlY3JldCwge1xuICAgIHVybCxcbiAgICBtc3BJZFxuICB9KSB7XG5cbiAgdHJ5IHtcbiAgICBsZXQgdXNlciA9IGF3YWl0IGNsaWVudC5nZXRVc2VyQ29udGV4dChlbnJvbGxtZW50SUQsIHRydWUpO1xuICAgIGlmICh1c2VyICYmIHVzZXIuaXNFbnJvbGxlZCgpKSB7XG4gICAgICByZXR1cm4gdXNlcjtcbiAgICB9XG5cbiAgICAvLyBOZWVkIHRvIGVucm9sbCB3aXRoIENBIHNlcnZlclxuICAgIGNvbnN0IGNhID0gbmV3IENBQ2xpZW50KHVybCwge1xuICAgICAgdmVyaWZ5OiBmYWxzZVxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnJvbGxtZW50ID0gYXdhaXQgY2EuZW5yb2xsKHtcbiAgICAgICAgZW5yb2xsbWVudElELFxuICAgICAgICBlbnJvbGxtZW50U2VjcmV0XG4gICAgICB9KTtcbiAgICAgIHVzZXIgPSBuZXcgVXNlcihlbnJvbGxtZW50SUQsIGNsaWVudCk7XG4gICAgICBhd2FpdCB1c2VyLnNldEVucm9sbG1lbnQoZW5yb2xsbWVudC5rZXksIGVucm9sbG1lbnQuY2VydGlmaWNhdGUsIG1zcElkKTtcbiAgICAgIGF3YWl0IGNsaWVudC5zZXRVc2VyQ29udGV4dCh1c2VyKTtcbiAgICAgIHJldHVybiB1c2VyO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEZhaWxlZCB0byBlbnJvbGwgYW5kIHBlcnNpc3QgVXNlci4gRXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGdldCBVc2VyQ29udGV4dCEgRXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRXJyb3IobWVzc2FnZSwgaW5uZXJFcnJvcikge1xuICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIGVycm9yLmlubmVyID0gaW5uZXJFcnJvcjtcbiAgY29uc29sZS5sb2coZXJyb3IubWVzc2FnZSk7XG4gIHRocm93IGVycm9yO1xufVxuXG5mdW5jdGlvbiBtYXJzaGFsQXJncyhhcmdzKSB7XG4gIGlmICghYXJncykge1xuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhcmdzID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbYXJnc107XG4gIH1cblxuICBsZXQgc25ha2VBcmdzID0gY2FtZWxUb1NuYWtlQ2FzZShhcmdzKTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgIHJldHVybiBzbmFrZUFyZ3MubWFwKFxuICAgICAgYXJnID0+IHR5cGVvZiBhcmcgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoYXJnKSA6IGFyZy50b1N0cmluZygpKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gW0pTT04uc3RyaW5naWZ5KHNuYWtlQXJncyldO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVubWFyc2hhbFJlc3VsdChyZXN1bHQpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGxldCBidWZmID0gQnVmZmVyLmNvbmNhdChyZXN1bHQpO1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWZmKSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgbGV0IGpzb24gPSBidWZmLnRvU3RyaW5nKCd1dGY4Jyk7XG4gIGlmICghanNvbikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBvYmogPSBKU09OLnBhcnNlKGpzb24pO1xuICByZXR1cm4gc25ha2VUb0NhbWVsQ2FzZShvYmopO1xufVxuXG5mdW5jdGlvbiB1bm1hcnNoYWxCbG9jayhibG9jaykge1xuICBjb25zdCB0cmFuc2FjdGlvbnMgPSBBcnJheS5pc0FycmF5KGJsb2NrLmRhdGEuZGF0YSkgP1xuICAgIGJsb2NrLmRhdGEuZGF0YS5tYXAoKHtcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICBkYXRhXG4gICAgICB9XG4gICAgfSkgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjaGFubmVsX2hlYWRlclxuICAgICAgfSA9IGhlYWRlcjtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICBlcG9jaFxuICAgICAgfSA9IGNoYW5uZWxfaGVhZGVyO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgdGltZXN0YW1wXG4gICAgICB9O1xuICAgIH0pIDogW107XG4gIHJldHVybiB7XG4gICAgaWQ6IGJsb2NrLmhlYWRlci5udW1iZXIudG9TdHJpbmcoKSxcbiAgICBmaW5nZXJwcmludDogYmxvY2suaGVhZGVyLmRhdGFfaGFzaC5zbGljZSgwLCAyMCksXG4gICAgdHJhbnNhY3Rpb25zXG4gIH07XG59XG4iXX0=