define( [
	'editor/editor',
	'tools/utils'
], function(
	Editor,
	utils
) {
	'use strict';

	var ckeditor = {
		instances: {}
	};

	ckeditor.create = function( selector, options ) {
		var editor = null,
			element;

		if ( utils.isString( selector ) ) {
			element = document.querySelectorAll( selector );

			if ( element.length > 1 ) {
				editor = [].map.call( element, function( el ) {
					var instance = ckeditor.instances[ 'editor_' + utils.uid( 'e' ) ] = new Editor( el, options );

					return instance;
				} );
			} else if ( element.length === 1 ) {
				editor = ckeditor.instances[ 'editor_' + utils.uid( 'e' ) ] = new Editor( element[ 0 ], options );
			}
		}

		return editor;
	};

	return ckeditor;
} );