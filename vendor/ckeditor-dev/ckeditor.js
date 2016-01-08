/* global define */

'use strict';

define( [ './core/editor.js' ], ( Editor ) => {
	return {
		init() {
			return new Editor();
		}
	};
} );