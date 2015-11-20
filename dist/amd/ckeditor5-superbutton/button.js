'use strict';

define(['exports', '../ckeditor5-button/button.js'], function (exports, _button) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _button2 = _interopRequireDefault(_button);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class SuperButton extends _button2.default {
		constructor() {
			super();
			console.log('SuperButton.constructor()');
		}

	}

	exports.default = SuperButton;
});
//# sourceMappingURL=button.js.map
