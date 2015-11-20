'use strict';

define(['exports', './ckeditor', './ckeditor5-basicstyles/bold', './ckeditor5-basicstyles/italic', './ckeditor5-classiccreator/classiccreator', './ckeditor5-image/imagecaption', './ckeditor5-button/button'], function (exports, _ckeditor, _bold, _italic, _classiccreator, _imagecaption, _button) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ckeditor2 = _interopRequireDefault(_ckeditor);

  var _bold2 = _interopRequireDefault(_bold);

  var _italic2 = _interopRequireDefault(_italic);

  var _classiccreator2 = _interopRequireDefault(_classiccreator);

  var _imagecaption2 = _interopRequireDefault(_imagecaption);

  var _button2 = _interopRequireDefault(_button);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  _ckeditor2.default.features = [_bold2.default, _italic2.default, _classiccreator2.default, _imagecaption2.default, _button2.default];
  exports.default = _ckeditor2.default;
});
//# sourceMappingURL=build-file.js.map
