'use strict'

/* global require */

;
define(['exports'], function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = load;

	function load(modulePath) {
		return new Promise(resolve => {
			resolve(require(modulePath));
		});
	}
});