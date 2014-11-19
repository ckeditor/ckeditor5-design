// basic Require.js configuration
requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/src/',
	paths: {
		plugins: '../../../lib/plugins'
	}
} );

( function( root ) {
	var basePathSrcPattern = /(^|.*[\\\/])ckeditor\.js(?:\?.*|;.*)?$/i,
		createBuffer = [];

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

	// create CKE namespace
	var CKE = root.CKE || {};
	CKE.define = CKE.define || define;
	CKE.require = CKE.require || require;

	// CKEditor base path, based on CKE4 code
	CKE.basePath = ( function() {
		var scripts = document.getElementsByTagName( 'script' ),
			path;

		[].some.call( scripts, function( script ) {
			var match = script.src.match( basePathSrcPattern );

			if ( match ) {
				path = match[ 1 ];
				return true;
			}
		} );

		if ( path.indexOf( ':/' ) == -1 && path.slice( 0, 2 ) != '//' ) {
			if ( path.indexOf( '/' ) === 0 ) {
				path = location.href.match( /^.*?:\/\/[^\/]*/ )[ 0 ] + path;
			} else {
				path = location.href.match( /^[^\?]*\/(?:)/ )[ 0 ] + path;
			}
		}

		return path;
	} )();

	CKE.instances = {};

	// buffer create calls
	CKE.create = function( selector, options ) {
		var editor = new Editor( selector, options );

		createBuffer.push( editor );

		return editor;
	};

	// return plugins base path for the dev environment
	function getPluginPath( name ) {
		return CKE.basePath + 'node_modules/ckeditor-plugin-' + name + '/src/';
	}

	CKE.getPluginPath = getPluginPath;

	// create editor instances from the buffer
	function create() {
		var editor = createBuffer.shift();

		if ( !editor ) {
			return;
		}

		var instance = CKE.create.call( CKE, editor.selector, editor.options );

		// TODO bind fake instance's events

		create();
	}

	root.CKE = CKE;

	require( [
		'api',
		'tools/utils'
	], function(
		api,
		utils
	) {
		// extend CKE namespace with the public API
		// overrides a temporary implementation of the "create" method
		utils.extend( root.CKE, api );

		// override default getPluginPath for the dev environment
		CKE.getPluginPath = getPluginPath;

		create();
	} );
} )( this );
