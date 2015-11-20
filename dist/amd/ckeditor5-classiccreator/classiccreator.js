'use strict';

define(['exports', '../ckeditor5-link/link', '../ckeditor5/proof'], function (exports, _link, _proof) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _link2 = _interopRequireDefault(_link);

	var _proof2 = _interopRequireDefault(_proof);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	(0, _proof2.default)('Calling from a plugin.');

	class ClassicCreator {
		constructor(editor) {
			console.log('ClassicCreator.constructor()');
			this.editor = editor;
			this.link = new _link2.default();
		}

	}

	exports.default = ClassicCreator;
});