'use strict';

define(['exports', './ckeditor5-core/editor', './ckeditor5/proof'], function (exports, _editor, _proof) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.create = create;

	var _editor2 = _interopRequireDefault(_editor);

	var _proof2 = _interopRequireDefault(_proof);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	(0, _proof2.default)('Calling from ckeditor.js');
	const CKEDITOR = {
		create: create
	};

	function create(config) {
		console.log('CKEDITOR.create()');
		const editor = new _editor2.default(config.features);
		return editor.init();
	}

	exports.default = CKEDITOR;
});
//# sourceMappingURL=ckeditor.js.map
