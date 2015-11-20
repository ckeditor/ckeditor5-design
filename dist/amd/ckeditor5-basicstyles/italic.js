'use strict';

define(['exports', './basicstyle'], function (exports, _basicstyle) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _basicstyle2 = _interopRequireDefault(_basicstyle);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class Italic extends _basicstyle2.default {
		constructor() {
			super();
			console.log('Italic.constructor()');
		}

	}

	exports.default = Italic;
});