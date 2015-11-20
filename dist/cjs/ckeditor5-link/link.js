'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _feature = require('../ckeditor5-core/feature.js');

var _feature2 = _interopRequireDefault(_feature);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Link extends _feature2.default {
	constructor() {
		super();

		console.log('Link.constructor()');
	}
}
exports.default = Link;