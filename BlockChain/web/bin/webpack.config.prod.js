'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import webpack from 'webpack';
const webpack = require('webpack');

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production')
};

exports.default = {
  devtool: 'source-map',
  entry: {
    'common': ['babel-polyfill', 'isomorphic-fetch', (0, _path.resolve)(__dirname, 'src/common')],
    //'agency': resolve(__dirname, 'src/agency/index'),
    'reviewer': (0, _path.resolve)(__dirname, 'src/reviewer/index'),
    'block-explorer': (0, _path.resolve)(__dirname, 'src/block-explorer/index')
  },
  target: 'web',
  output: {
    path: (0, _path.resolve)(__dirname, '../app/static/js'), // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  plugins: [new webpack.DefinePlugin(GLOBALS), new webpack.optimize.UglifyJsPlugin()],
  module: {
    rules: [{ test: /\.js$/, use: ['babel-loader'] }, {
      test: /(\.css)$/, use: ['style-loader', 'css-loader', {
        loader: 'postcss-loader',
        options: {
          plugins: () => [(0, _autoprefixer2.default)('last 5 versions', 'ie 10')]
        }
      }]
    }, {
      test: /(\.scss)$/, use: ['style-loader', 'css-loader', {
        loader: 'postcss-loader',
        options: {
          plugins: () => [(0, _autoprefixer2.default)('last 5 versions', 'ie 10')]
        }
      }, {
        loader: 'sass-loader',
        options: {
          includePaths: [(0, _path.resolve)(__dirname, 'node_modules/normalize-scss/sass')]
        }
      }]
    }, { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' }, { test: /\.(woff|woff2)$/, use: 'url?prefix=font/&limit=5000' }, { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' }, { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }]
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3dlYnBhY2suY29uZmlnLnByb2QuanMiXSwibmFtZXMiOlsid2VicGFjayIsInJlcXVpcmUiLCJHTE9CQUxTIiwiSlNPTiIsInN0cmluZ2lmeSIsImRldnRvb2wiLCJlbnRyeSIsIl9fZGlybmFtZSIsInRhcmdldCIsIm91dHB1dCIsInBhdGgiLCJwdWJsaWNQYXRoIiwiZmlsZW5hbWUiLCJwbHVnaW5zIiwiRGVmaW5lUGx1Z2luIiwib3B0aW1pemUiLCJVZ2xpZnlKc1BsdWdpbiIsIm1vZHVsZSIsInJ1bGVzIiwidGVzdCIsInVzZSIsImxvYWRlciIsIm9wdGlvbnMiLCJpbmNsdWRlUGF0aHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztBQUNBOzs7Ozs7QUFGQTtBQUdBLE1BQU1BLFVBQVVDLFFBQVEsU0FBUixDQUFoQjs7QUFFQSxNQUFNQyxVQUFVO0FBQ2QsMEJBQXdCQyxLQUFLQyxTQUFMLENBQWUsWUFBZjtBQURWLENBQWhCOztrQkFJZTtBQUNiQyxXQUFTLFlBREk7QUFFYkMsU0FBTztBQUNMLGNBQVUsQ0FDUixnQkFEUSxFQUVSLGtCQUZRLEVBR1IsbUJBQVFDLFNBQVIsRUFBbUIsWUFBbkIsQ0FIUSxDQURMO0FBTUw7QUFDQSxnQkFBWSxtQkFBUUEsU0FBUixFQUFtQixvQkFBbkIsQ0FQUDtBQVFMLHNCQUFrQixtQkFBUUEsU0FBUixFQUFtQiwwQkFBbkI7QUFSYixHQUZNO0FBWWJDLFVBQVEsS0FaSztBQWFiQyxVQUFRO0FBQ05DLFVBQU0sbUJBQVFILFNBQVIsRUFBbUIsa0JBQW5CLENBREEsRUFDd0M7QUFDOUNJLGdCQUFZLEdBRk47QUFHTkMsY0FBVTtBQUhKLEdBYks7QUFrQmJDLFdBQVMsQ0FDUCxJQUFJYixRQUFRYyxZQUFaLENBQXlCWixPQUF6QixDQURPLEVBRVAsSUFBSUYsUUFBUWUsUUFBUixDQUFpQkMsY0FBckIsRUFGTyxDQWxCSTtBQXNCYkMsVUFBUTtBQUNOQyxXQUFPLENBQ0wsRUFBRUMsTUFBTSxPQUFSLEVBQWlCQyxLQUFLLENBQUMsY0FBRCxDQUF0QixFQURLLEVBRUw7QUFDRUQsWUFBTSxVQURSLEVBQ29CQyxLQUFLLENBQUMsY0FBRCxFQUFpQixZQUFqQixFQUNyQjtBQUNFQyxnQkFBUSxnQkFEVjtBQUVFQyxpQkFBUztBQUNQVCxtQkFBUyxNQUFNLENBQUMsNEJBQWEsaUJBQWIsRUFBZ0MsT0FBaEMsQ0FBRDtBQURSO0FBRlgsT0FEcUI7QUFEekIsS0FGSyxFQVlMO0FBQ0VNLFlBQU0sV0FEUixFQUNxQkMsS0FBSyxDQUN0QixjQURzQixFQUNOLFlBRE0sRUFFdEI7QUFDRUMsZ0JBQVEsZ0JBRFY7QUFFRUMsaUJBQVM7QUFDUFQsbUJBQVMsTUFBTSxDQUFDLDRCQUFhLGlCQUFiLEVBQWdDLE9BQWhDLENBQUQ7QUFEUjtBQUZYLE9BRnNCLEVBUXRCO0FBQ0VRLGdCQUFRLGFBRFY7QUFFRUMsaUJBQVM7QUFDUEMsd0JBQWMsQ0FDWixtQkFBUWhCLFNBQVIsRUFBbUIsa0NBQW5CLENBRFk7QUFEUDtBQUZYLE9BUnNCO0FBRDFCLEtBWkssRUErQkwsRUFBRVksTUFBTSw0QkFBUixFQUFzQ0MsS0FBSyxhQUEzQyxFQS9CSyxFQWdDTCxFQUFFRCxNQUFNLGlCQUFSLEVBQTJCQyxLQUFLLDZCQUFoQyxFQWhDSyxFQWlDTCxFQUFFRCxNQUFNLDRCQUFSLEVBQXNDQyxLQUFLLDBEQUEzQyxFQWpDSyxFQWtDTCxFQUFFRCxNQUFNLDRCQUFSLEVBQXNDQyxLQUFLLCtDQUEzQyxFQWxDSztBQUREO0FBdEJLLEMiLCJmaWxlIjoid2VicGFjay5jb25maWcucHJvZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vaW1wb3J0IHdlYnBhY2sgZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XG5jb25zdCB3ZWJwYWNrID0gcmVxdWlyZSgnd2VicGFjaycpO1xuXG5jb25zdCBHTE9CQUxTID0ge1xuICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeSgncHJvZHVjdGlvbicpXG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRldnRvb2w6ICdzb3VyY2UtbWFwJyxcbiAgZW50cnk6IHtcbiAgICAnY29tbW9uJzogW1xuICAgICAgJ2JhYmVsLXBvbHlmaWxsJyxcbiAgICAgICdpc29tb3JwaGljLWZldGNoJyxcbiAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbW1vbicpXG4gICAgXSxcbiAgICAvLydhZ2VuY3knOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9hZ2VuY3kvaW5kZXgnKSxcbiAgICAncmV2aWV3ZXInOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9yZXZpZXdlci9pbmRleCcpLFxuICAgICdibG9jay1leHBsb3Jlcic6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2Jsb2NrLWV4cGxvcmVyL2luZGV4JylcbiAgfSxcbiAgdGFyZ2V0OiAnd2ViJyxcbiAgb3V0cHV0OiB7XG4gICAgcGF0aDogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9hcHAvc3RhdGljL2pzJyksIC8vIE5vdGU6IFBoeXNpY2FsIGZpbGVzIGFyZSBvbmx5IG91dHB1dCBieSB0aGUgcHJvZHVjdGlvbiBidWlsZCB0YXNrIGBucG0gcnVuIGJ1aWxkYC5cbiAgICBwdWJsaWNQYXRoOiAnLycsXG4gICAgZmlsZW5hbWU6ICdbbmFtZV0uYnVuZGxlLmpzJ1xuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgbmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKEdMT0JBTFMpLFxuICAgIG5ldyB3ZWJwYWNrLm9wdGltaXplLlVnbGlmeUpzUGx1Z2luKClcbiAgXSxcbiAgbW9kdWxlOiB7XG4gICAgcnVsZXM6IFtcbiAgICAgIHsgdGVzdDogL1xcLmpzJC8sIHVzZTogWydiYWJlbC1sb2FkZXInXSB9LFxuICAgICAge1xuICAgICAgICB0ZXN0OiAvKFxcLmNzcykkLywgdXNlOiBbJ3N0eWxlLWxvYWRlcicsICdjc3MtbG9hZGVyJyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsb2FkZXI6ICdwb3N0Y3NzLWxvYWRlcicsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIHBsdWdpbnM6ICgpID0+IFthdXRvcHJlZml4ZXIoJ2xhc3QgNSB2ZXJzaW9ucycsICdpZSAxMCcpXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGVzdDogLyhcXC5zY3NzKSQvLCB1c2U6IFtcbiAgICAgICAgICAnc3R5bGUtbG9hZGVyJywgJ2Nzcy1sb2FkZXInLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxvYWRlcjogJ3Bvc3Rjc3MtbG9hZGVyJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgcGx1Z2luczogKCkgPT4gW2F1dG9wcmVmaXhlcignbGFzdCA1IHZlcnNpb25zJywgJ2llIDEwJyldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsb2FkZXI6ICdzYXNzLWxvYWRlcicsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGluY2x1ZGVQYXRoczogW1xuICAgICAgICAgICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL25vcm1hbGl6ZS1zY3NzL3Nhc3MnKVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgeyB0ZXN0OiAvXFwuZW90KFxcP3Y9XFxkK1xcLlxcZCtcXC5cXGQrKT8kLywgdXNlOiAnZmlsZS1sb2FkZXInIH0sXG4gICAgICB7IHRlc3Q6IC9cXC4od29mZnx3b2ZmMikkLywgdXNlOiAndXJsP3ByZWZpeD1mb250LyZsaW1pdD01MDAwJyB9LFxuICAgICAgeyB0ZXN0OiAvXFwudHRmKFxcP3Y9XFxkK1xcLlxcZCtcXC5cXGQrKT8kLywgdXNlOiAndXJsLWxvYWRlcj9saW1pdD0xMDAwMCZtaW1ldHlwZT1hcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nIH0sXG4gICAgICB7IHRlc3Q6IC9cXC5zdmcoXFw/dj1cXGQrXFwuXFxkK1xcLlxcZCspPyQvLCB1c2U6ICd1cmwtbG9hZGVyP2xpbWl0PTEwMDAwJm1pbWV0eXBlPWltYWdlL3N2Zyt4bWwnIH1cbiAgICBdXG4gIH1cbn07XG4iXX0=