// basic Require.js configuration
requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/src/',
	paths: {
		plugins: '../../../lib/plugins'
	}
} );

( function( root ) {
	// create CKEDITOR namespace
	root.CKEDITOR = root.CKEDITOR || {};
	CKEDITOR.define = CKEDITOR.define || define;
	CKEDITOR.require = CKEDITOR.require || require;

	var createBuffer = [];

	// CKEditor instance stub
	function Editor( selector, options ) {
		this.selector = selector;
		this.options = options;
		this.isCreated = false;
		this.on = {};
		this.once = {};
	}

	Editor.prototype.on = function( name, callback, ctx ) {
		this.on[ name ] = callback.bind( ctx );
	};

	Editor.prototype.once = function( name, callback, ctx ) {
		this.once[ name ] = callback.bind( ctx );
	};

	// buffer create calls
	CKEDITOR.create = function( selector, options ) {
		var editor = new Editor( selector, options );

		createBuffer.push( editor );

		return editor;
	};

	// create editor instances from the buffer
	function create() {
		var editor = createBuffer.shift();

		if ( !editor ) {
			return;
		}

		var instance = CKEDITOR.create.call( CKEDITOR, editor.selector, editor.options );

		// TODO bind fake instance's events

		create();
	}

	require( [
		'api',
		'tools/utils'
	], function(
		api,
		utils
	) {
		// extend CKEDITOR namespace with the public API
		// overrides a temporary implementation of the "create" method
		utils.extend( root.CKEDITOR, api );
		create();
	} );
} )( this );
