'use strict'

/* global require */

// We import the 'require' module, so Require.JS gives us a localized version of require().
// Otherwise we would use the global one which resolves paths relatively to the base dir.
;
define(['exports', 'require'], function (exports, _require2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = load;

	var _require3 = _interopRequireDefault(_require2);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function load(modulePath) {
		return new Promise((resolve, reject) => {
			(0, _require3.default)([modulePath], module => {
				resolve(module);
			}, err => {
				reject(err);
			});
		});
	}
});