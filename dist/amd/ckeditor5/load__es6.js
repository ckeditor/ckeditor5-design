'use strict'

/* global System */

;
define(['exports'], function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = load;

	function load(modulePath) {
		return System.import(modulePath).then(module => {
			return module;
		});
	}
});