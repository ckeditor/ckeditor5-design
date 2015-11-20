'use strict'

/* global System */

;
Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = load;
function load(modulePath) {
	return System.import(modulePath).then(module => {
		return module;
	});
}