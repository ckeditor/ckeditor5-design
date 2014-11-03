define( [
	'editor/editor',
	'core/mvc',
	'ui/ui',
	'tools/utils'
], function(
	Editor,
	MVC,
	ui,
	utils
) {
	'use strict';

	var CKEDITOR = {
		instances: {},
		ui: ui
	};

	CKEDITOR.create = function( selector, options ) {
		var id = 'editor_' + utils.uid( 'e' ),
			editor = CKEDITOR.instances[ id ] = new Editor( selector, options );

		return editor;
	};

	CKEDITOR.use = function( options ) {

	};

	return CKEDITOR;
} );