'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _button = require('../ckeditor5-button/button.js');

var _button2 = _interopRequireDefault(_button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SuperButton extends _button2.default {
	constructor() {
		super();

		console.log('SuperButton.constructor()');
	}
}
exports.default = SuperButton;