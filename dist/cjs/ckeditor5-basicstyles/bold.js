'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _basicstyle = require('./basicstyle');

var _basicstyle2 = _interopRequireDefault(_basicstyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bold extends _basicstyle2.default {
	constructor() {
		super();

		console.log('Bold.constructor()');
	}
}
exports.default = Bold;