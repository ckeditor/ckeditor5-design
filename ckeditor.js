requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/src/'
} );

( function( root ) {
	// create CKEDITOR namespace
	root.CKEDITOR = root.CKEDITOR || {};
	CKEDITOR.define = CKEDITOR.define || define;
	CKEDITOR.require = CKEDITOR.require || require;

	var createBuffer = [];

	// buffer create calls
	CKEDITOR.create = function( selector, options ) {
		createBuffer.push( arguments );
	};

	// create editor instances from the buffer
	function create() {
		var options = createBuffer.shift();

		if ( !options ) {
			return;
		}

		CKEDITOR.create.apply( null, options );

		create();
	}

	require( [
		'api',
		'tools/utils',
		'plugins!samplecreator',
		'plugins!example'
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
