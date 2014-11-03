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

	var ckeditor = utils.extend( {
		instances: {},
		ui: ui
	}, Emitter );

	ckeditor.create = function( selector, options ) {
		var id = 'editor_' + utils.uid( 'e' ),
			editor;

		this.trigger( 'before:create', id );
		editor = ckeditor.instances[ id ] = new Editor( selector, options );
		this.trigger( 'create', editor );

		return editor;
	};

	ckeditor.use = function( options ) {

	};

	return ckeditor;
} );