'use strict';

module.exports = function randomId() {
	return String.fromCharCode( 65 + Math.floor( Math.random() * 26 ) );
};
