/* global define */

'use strict';

define( 'ckeditor', [ './core/editor.js' ], ( Editor ) => {
	return {
		init() {
			return new Editor();
		}
	};
} );