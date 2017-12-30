'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  const isDev = app.get('env') === 'development';

  _i18n2.default.configure({
    locales: ['en', 'de'],
    fallbacks: {
      'de_DE': ['de', 'en'],
      'de': ['en']
    },
    cookie: 'applang',
    queryParameter: 'applang',
    autoReload: isDev,
    directory: _path2.default.resolve(__dirname, "../../locales")
  });

  // Set cookie 'applang' if query parameter is set to persist result
  app.use((req, res, next) => {
    const langParam = req.query['applang'];
    if (langParam) {
      res.cookie('applang', langParam);
    }
    next();
  });
  app.use(_i18n2.default.init);
};

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3d3dy9jb25maWcvaTE4bi5qcyJdLCJuYW1lcyI6WyJhcHAiLCJpc0RldiIsImdldCIsImNvbmZpZ3VyZSIsImxvY2FsZXMiLCJmYWxsYmFja3MiLCJjb29raWUiLCJxdWVyeVBhcmFtZXRlciIsImF1dG9SZWxvYWQiLCJkaXJlY3RvcnkiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsImxhbmdQYXJhbSIsInF1ZXJ5IiwiaW5pdCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztrQkFLZSxVQUFVQSxHQUFWLEVBQWU7QUFDNUIsUUFBTUMsUUFBUUQsSUFBSUUsR0FBSixDQUFRLEtBQVIsTUFBbUIsYUFBakM7O0FBRUEsaUJBQUtDLFNBQUwsQ0FBZTtBQUNiQyxhQUFTLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FESTtBQUViQyxlQUFXO0FBQ1QsZUFBUyxDQUFDLElBQUQsRUFBTyxJQUFQLENBREE7QUFFVCxZQUFNLENBQUMsSUFBRDtBQUZHLEtBRkU7QUFNYkMsWUFBUSxTQU5LO0FBT2JDLG9CQUFnQixTQVBIO0FBUWJDLGdCQUFZUCxLQVJDO0FBU2JRLGVBQVcsZUFBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLGVBQXhCO0FBVEUsR0FBZjs7QUFZQTtBQUNBWCxNQUFJWSxHQUFKLENBQVEsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQVdDLElBQVgsS0FBb0I7QUFDMUIsVUFBTUMsWUFBWUgsSUFBSUksS0FBSixDQUFVLFNBQVYsQ0FBbEI7QUFDQSxRQUFJRCxTQUFKLEVBQWU7QUFDYkYsVUFBSVIsTUFBSixDQUFXLFNBQVgsRUFBc0JVLFNBQXRCO0FBQ0Q7QUFDREQ7QUFDRCxHQU5EO0FBT0FmLE1BQUlZLEdBQUosQ0FBUSxlQUFLTSxJQUFiO0FBQ0QsQzs7QUEzQkQ7Ozs7QUFDQSIsImZpbGUiOiJpMThuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgaTE4biBmcm9tICdpMThuJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoYXBwKSB7XG4gIGNvbnN0IGlzRGV2ID0gYXBwLmdldCgnZW52JykgPT09ICdkZXZlbG9wbWVudCc7XG5cbiAgaTE4bi5jb25maWd1cmUoe1xuICAgIGxvY2FsZXM6IFsnZW4nLCAnZGUnXSxcbiAgICBmYWxsYmFja3M6IHtcbiAgICAgICdkZV9ERSc6IFsnZGUnLCAnZW4nXSxcbiAgICAgICdkZSc6IFsnZW4nXVxuICAgIH0sXG4gICAgY29va2llOiAnYXBwbGFuZycsXG4gICAgcXVlcnlQYXJhbWV0ZXI6ICdhcHBsYW5nJyxcbiAgICBhdXRvUmVsb2FkOiBpc0RldixcbiAgICBkaXJlY3Rvcnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vbG9jYWxlc1wiKVxuICB9KTtcblxuICAvLyBTZXQgY29va2llICdhcHBsYW5nJyBpZiBxdWVyeSBwYXJhbWV0ZXIgaXMgc2V0IHRvIHBlcnNpc3QgcmVzdWx0XG4gIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgbGFuZ1BhcmFtID0gcmVxLnF1ZXJ5WydhcHBsYW5nJ107XG4gICAgaWYgKGxhbmdQYXJhbSkge1xuICAgICAgcmVzLmNvb2tpZSgnYXBwbGFuZycsIGxhbmdQYXJhbSk7XG4gICAgfVxuICAgIG5leHQoKTtcbiAgfSk7XG4gIGFwcC51c2UoaTE4bi5pbml0KTtcbn1cbiJdfQ==