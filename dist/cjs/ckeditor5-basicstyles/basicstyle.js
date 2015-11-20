'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _feature = require('../ckeditor5-core/feature');

var _feature2 = _interopRequireDefault(_feature);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BasicStyle extends _feature2.default {
	constructor() {
		super();

		console.log('BasicStyle.constructor()');
	}
}
exports.default = BasicStyle;