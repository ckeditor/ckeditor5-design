'use strict'

/* global require */

;
Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = load;
function load(modulePath) {
	return new Promise(resolve => {
		resolve(require(modulePath));
	});
}