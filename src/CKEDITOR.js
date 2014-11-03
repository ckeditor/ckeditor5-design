define( [
	'editor/editor',
	'core/mvc',
	'tools/emitter',
	'tools/utils',
	'ui/ui'
], function(
	Editor,
	MVC,
	Emitter,
	utils,
	ui
) {
	'use strict';

	var CKEDITOR = utils.extend( {
		instances: {},
		ui: ui
	}, Emitter );

	CKEDITOR.create = function( selector, options ) {
		var id = 'editor_' + utils.uid( 'e' ),
			editor;

		this.trigger( 'before:create', id );
		editor = CKEDITOR.instances[ id ] = new Editor( selector, options );
		this.trigger( 'create', editor );

		return editor;
	};

	CKEDITOR.use = function( options ) {

	};

	return CKEDITOR;
} );