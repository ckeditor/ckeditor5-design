/* global define */

'use strict';

define( 'ckeditor', [ 'ckeditor5/core/editor' ], ( Editor ) => {
	return {
		init() {
			return new Editor();
		}
	};
} );

define( 'ckeditor5/core/editor', () => {
	return class Editor {
		constructor() {
			console.log( 'editor inited!' );
		}
	};
} );