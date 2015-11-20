'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ckeditor = require('./ckeditor');

var _ckeditor2 = _interopRequireDefault(_ckeditor);

var _bold = require('./ckeditor5-basicstyles/bold');

var _bold2 = _interopRequireDefault(_bold);

var _italic = require('./ckeditor5-basicstyles/italic');

var _italic2 = _interopRequireDefault(_italic);

var _classiccreator = require('./ckeditor5-classiccreator/classiccreator');

var _classiccreator2 = _interopRequireDefault(_classiccreator);

var _imagecaption = require('./ckeditor5-image/imagecaption');

var _imagecaption2 = _interopRequireDefault(_imagecaption);

var _button = require('./ckeditor5-button/button');

var _button2 = _interopRequireDefault(_button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_ckeditor2.default.features = [_bold2.default, _italic2.default, _classiccreator2.default, _imagecaption2.default, _button2.default];

exports.default = _ckeditor2.default;