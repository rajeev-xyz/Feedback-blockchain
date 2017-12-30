'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _path = require('path');

const basePath = (0, _path.resolve)(__dirname, '../../certs');
const readCryptoFile = filename => (0, _fs.readFileSync)((0, _path.resolve)(basePath, filename)).toString();
const config = {
  channelName: 'default',
  channelConfig: (0, _fs.readFileSync)((0, _path.resolve)(__dirname, '../../channel.tx')),
  chaincodeId: 'bcins',
  chaincodeVersion: 'v8',
  chaincodePath: 'bcins',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpcs://orderer0:7050',
    pem: readCryptoFile('ordererOrg.pem')
  },
  reviewerOrg: {
    peer: {
      hostname: 'reviewer-peer',
      url: 'grpcs://reviewer-peer:7051',
      eventHubUrl: 'grpcs://reviewer-peer:7053',
      pem: readCryptoFile('reviewerOrg.pem')
    },
    ca: {
      hostname: 'reviewer-ca',
      url: 'https://reviewer-ca:7054',
      mspId: 'ReviewerOrgMSP'
    },
    admin: {
      key: readCryptoFile('Admin@reviewer-org-key.pem'),
      cert: readCryptoFile('Admin@reviewer-org-cert.pem')
    }
  },
  agencyOrg: {
    peer: {
      hostname: 'agency-peer',
      url: 'grpcs://agency-peer:7051',
      pem: readCryptoFile('agencyOrg.pem'),
      eventHubUrl: 'grpcs://agency-peer:7053'
    },
    ca: {
      hostname: 'agency-ca',
      url: 'https://agency-ca:7054',
      mspId: 'AgencyOrgMSP'
    },
    admin: {
      key: readCryptoFile('Admin@agency-org-key.pem'),
      cert: readCryptoFile('Admin@agency-org-cert.pem')
    }
  }
};

if (process.env.LOCALCONFIG) {
  config.orderer0.url = 'grpcs://localhost:7050';

  config.reviewerOrg.peer.url = 'grpcs://localhost:7051';
  config.agencyOrg.peer.url = 'grpcs://localhost:8051';

  config.reviewerOrg.peer.eventHubUrl = 'grpcs://localhost:7053';
  config.agencyOrg.peer.eventHubUrl = 'grpcs://localhost:8053';

  config.reviewerOrg.ca.url = 'https://localhost:7054';
  config.agencyOrg.ca.url = 'https://localhost:8054';
}

exports.default = config;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9ibG9ja2NoYWluL2NvbmZpZy5qcyJdLCJuYW1lcyI6WyJiYXNlUGF0aCIsIl9fZGlybmFtZSIsInJlYWRDcnlwdG9GaWxlIiwiZmlsZW5hbWUiLCJ0b1N0cmluZyIsImNvbmZpZyIsImNoYW5uZWxOYW1lIiwiY2hhbm5lbENvbmZpZyIsImNoYWluY29kZUlkIiwiY2hhaW5jb2RlVmVyc2lvbiIsImNoYWluY29kZVBhdGgiLCJvcmRlcmVyMCIsImhvc3RuYW1lIiwidXJsIiwicGVtIiwicmV2aWV3ZXJPcmciLCJwZWVyIiwiZXZlbnRIdWJVcmwiLCJjYSIsIm1zcElkIiwiYWRtaW4iLCJrZXkiLCJjZXJ0IiwiYWdlbmN5T3JnIiwicHJvY2VzcyIsImVudiIsIkxPQ0FMQ09ORklHIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7QUFFQSxNQUFNQSxXQUFXLG1CQUFRQyxTQUFSLEVBQW1CLGFBQW5CLENBQWpCO0FBQ0EsTUFBTUMsaUJBQ0pDLFlBQVksc0JBQWEsbUJBQVFILFFBQVIsRUFBa0JHLFFBQWxCLENBQWIsRUFBMENDLFFBQTFDLEVBRGQ7QUFFQSxNQUFNQyxTQUFTO0FBQ2JDLGVBQWEsU0FEQTtBQUViQyxpQkFBZSxzQkFBYSxtQkFBUU4sU0FBUixFQUFtQixrQkFBbkIsQ0FBYixDQUZGO0FBR2JPLGVBQWEsT0FIQTtBQUliQyxvQkFBa0IsSUFKTDtBQUtiQyxpQkFBZSxPQUxGO0FBTWJDLFlBQVU7QUFDUkMsY0FBVSxVQURGO0FBRVJDLFNBQUssdUJBRkc7QUFHUkMsU0FBS1osZUFBZSxnQkFBZjtBQUhHLEdBTkc7QUFXYmEsZUFBYTtBQUNYQyxVQUFNO0FBQ0pKLGdCQUFVLGVBRE47QUFFSkMsV0FBSyw0QkFGRDtBQUdKSSxtQkFBYSw0QkFIVDtBQUlKSCxXQUFLWixlQUFlLGlCQUFmO0FBSkQsS0FESztBQU9YZ0IsUUFBSTtBQUNGTixnQkFBVSxhQURSO0FBRUZDLFdBQUssMEJBRkg7QUFHRk0sYUFBTztBQUhMLEtBUE87QUFZWEMsV0FBTztBQUNMQyxXQUFLbkIsZUFBZSw0QkFBZixDQURBO0FBRUxvQixZQUFNcEIsZUFBZSw2QkFBZjtBQUZEO0FBWkksR0FYQTtBQTRCYnFCLGFBQVc7QUFDVFAsVUFBTTtBQUNKSixnQkFBVSxhQUROO0FBRUpDLFdBQUssMEJBRkQ7QUFHSkMsV0FBS1osZUFBZSxlQUFmLENBSEQ7QUFJSmUsbUJBQWE7QUFKVCxLQURHO0FBT1RDLFFBQUk7QUFDRk4sZ0JBQVUsV0FEUjtBQUVGQyxXQUFLLHdCQUZIO0FBR0ZNLGFBQU87QUFITCxLQVBLO0FBWVRDLFdBQU87QUFDTEMsV0FBS25CLGVBQWUsMEJBQWYsQ0FEQTtBQUVMb0IsWUFBTXBCLGVBQWUsMkJBQWY7QUFGRDtBQVpFO0FBNUJFLENBQWY7O0FBK0NBLElBQUlzQixRQUFRQyxHQUFSLENBQVlDLFdBQWhCLEVBQTZCO0FBQzNCckIsU0FBT00sUUFBUCxDQUFnQkUsR0FBaEIsR0FBc0Isd0JBQXRCOztBQUVBUixTQUFPVSxXQUFQLENBQW1CQyxJQUFuQixDQUF3QkgsR0FBeEIsR0FBOEIsd0JBQTlCO0FBQ0FSLFNBQU9rQixTQUFQLENBQWlCUCxJQUFqQixDQUFzQkgsR0FBdEIsR0FBNEIsd0JBQTVCOztBQUVBUixTQUFPVSxXQUFQLENBQW1CQyxJQUFuQixDQUF3QkMsV0FBeEIsR0FBc0Msd0JBQXRDO0FBQ0FaLFNBQU9rQixTQUFQLENBQWlCUCxJQUFqQixDQUFzQkMsV0FBdEIsR0FBb0Msd0JBQXBDOztBQUVBWixTQUFPVSxXQUFQLENBQW1CRyxFQUFuQixDQUFzQkwsR0FBdEIsR0FBNEIsd0JBQTVCO0FBQ0FSLFNBQU9rQixTQUFQLENBQWlCTCxFQUFqQixDQUFvQkwsR0FBcEIsR0FBMEIsd0JBQTFCO0FBQ0Q7O2tCQUVjUixNIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuY29uc3QgYmFzZVBhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2NlcnRzJyk7XG5jb25zdCByZWFkQ3J5cHRvRmlsZSA9XG4gIGZpbGVuYW1lID0+IHJlYWRGaWxlU3luYyhyZXNvbHZlKGJhc2VQYXRoLCBmaWxlbmFtZSkpLnRvU3RyaW5nKCk7XG5jb25zdCBjb25maWcgPSB7XG4gIGNoYW5uZWxOYW1lOiAnZGVmYXVsdCcsXG4gIGNoYW5uZWxDb25maWc6IHJlYWRGaWxlU3luYyhyZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2NoYW5uZWwudHgnKSksXG4gIGNoYWluY29kZUlkOiAnYmNpbnMnLFxuICBjaGFpbmNvZGVWZXJzaW9uOiAndjgnLFxuICBjaGFpbmNvZGVQYXRoOiAnYmNpbnMnLFxuICBvcmRlcmVyMDoge1xuICAgIGhvc3RuYW1lOiAnb3JkZXJlcjAnLFxuICAgIHVybDogJ2dycGNzOi8vb3JkZXJlcjA6NzA1MCcsXG4gICAgcGVtOiByZWFkQ3J5cHRvRmlsZSgnb3JkZXJlck9yZy5wZW0nKVxuICB9LFxuICByZXZpZXdlck9yZzoge1xuICAgIHBlZXI6IHtcbiAgICAgIGhvc3RuYW1lOiAncmV2aWV3ZXItcGVlcicsXG4gICAgICB1cmw6ICdncnBjczovL3Jldmlld2VyLXBlZXI6NzA1MScsXG4gICAgICBldmVudEh1YlVybDogJ2dycGNzOi8vcmV2aWV3ZXItcGVlcjo3MDUzJyxcbiAgICAgIHBlbTogcmVhZENyeXB0b0ZpbGUoJ3Jldmlld2VyT3JnLnBlbScpXG4gICAgfSxcbiAgICBjYToge1xuICAgICAgaG9zdG5hbWU6ICdyZXZpZXdlci1jYScsXG4gICAgICB1cmw6ICdodHRwczovL3Jldmlld2VyLWNhOjcwNTQnLFxuICAgICAgbXNwSWQ6ICdSZXZpZXdlck9yZ01TUCdcbiAgICB9LFxuICAgIGFkbWluOiB7XG4gICAgICBrZXk6IHJlYWRDcnlwdG9GaWxlKCdBZG1pbkByZXZpZXdlci1vcmcta2V5LnBlbScpLFxuICAgICAgY2VydDogcmVhZENyeXB0b0ZpbGUoJ0FkbWluQHJldmlld2VyLW9yZy1jZXJ0LnBlbScpXG4gICAgfVxuICB9LFxuICBhZ2VuY3lPcmc6IHtcbiAgICBwZWVyOiB7XG4gICAgICBob3N0bmFtZTogJ2FnZW5jeS1wZWVyJyxcbiAgICAgIHVybDogJ2dycGNzOi8vYWdlbmN5LXBlZXI6NzA1MScsXG4gICAgICBwZW06IHJlYWRDcnlwdG9GaWxlKCdhZ2VuY3lPcmcucGVtJyksXG4gICAgICBldmVudEh1YlVybDogJ2dycGNzOi8vYWdlbmN5LXBlZXI6NzA1MycsXG4gICAgfSxcbiAgICBjYToge1xuICAgICAgaG9zdG5hbWU6ICdhZ2VuY3ktY2EnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9hZ2VuY3ktY2E6NzA1NCcsXG4gICAgICBtc3BJZDogJ0FnZW5jeU9yZ01TUCdcbiAgICB9LFxuICAgIGFkbWluOiB7XG4gICAgICBrZXk6IHJlYWRDcnlwdG9GaWxlKCdBZG1pbkBhZ2VuY3ktb3JnLWtleS5wZW0nKSxcbiAgICAgIGNlcnQ6IHJlYWRDcnlwdG9GaWxlKCdBZG1pbkBhZ2VuY3ktb3JnLWNlcnQucGVtJylcbiAgICB9XG4gIH1cbn07XG5cbmlmIChwcm9jZXNzLmVudi5MT0NBTENPTkZJRykge1xuICBjb25maWcub3JkZXJlcjAudXJsID0gJ2dycGNzOi8vbG9jYWxob3N0OjcwNTAnO1xuXG4gIGNvbmZpZy5yZXZpZXdlck9yZy5wZWVyLnVybCA9ICdncnBjczovL2xvY2FsaG9zdDo3MDUxJztcbiAgY29uZmlnLmFnZW5jeU9yZy5wZWVyLnVybCA9ICdncnBjczovL2xvY2FsaG9zdDo4MDUxJztcblxuICBjb25maWcucmV2aWV3ZXJPcmcucGVlci5ldmVudEh1YlVybCA9ICdncnBjczovL2xvY2FsaG9zdDo3MDUzJztcbiAgY29uZmlnLmFnZW5jeU9yZy5wZWVyLmV2ZW50SHViVXJsID0gJ2dycGNzOi8vbG9jYWxob3N0OjgwNTMnO1xuICBcbiAgY29uZmlnLnJldmlld2VyT3JnLmNhLnVybCA9ICdodHRwczovL2xvY2FsaG9zdDo3MDU0JztcbiAgY29uZmlnLmFnZW5jeU9yZy5jYS51cmwgPSAnaHR0cHM6Ly9sb2NhbGhvc3Q6ODA1NCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcblxuXG5cbiJdfQ==