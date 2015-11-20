'use strict';

define(['exports', '../ckeditor5-core/feature.js', './image.js'], function (exports, _feature, _image) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _feature2 = _interopRequireDefault(_feature);

	var _image2 = _interopRequireDefault(_image);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class ImageCaption extends _feature2.default {
		constructor(editor) {
			super();
			console.log('ImageCaption.constructor()');
			console.log('Image should already be initialised', editor.features.get(_image2.default));
		}

	}

	exports.default = ImageCaption;
	ImageCaption.requires = [_image2.default];
});