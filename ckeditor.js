// Bootstrap file for the dev version of CKEditor.

( function() {
	if ( typeof CKEDITOR != 'undefined' && CKEDITOR.define ) {
		bootstrap();
		return;
	}

	// Calculate the CKEditor installation path.
	var baseUrl = ( function() {
		var path = window.CKEDITOR_BASEPATH || '';

		if ( !path ) {
			// Find out the editor directory path, based on its <script> tag.
			var scripts = document.getElementsByTagName( 'script' );

			for ( var i = 0; i < scripts.length; i++ ) {
				var match = scripts[ i ].src.match( /(^|.*[\\\/])ckeditor.js(?:\?.*)?$/i );

				if ( match ) {
					path = match[ 1 ];
					break;
				}
			}
		}

		// In IE (only) the script.src string is the raw value entered in the
		// HTML source. Other browsers return the full resolved URL instead.
		if ( path.indexOf( ':/' ) == -1 && path.slice( 0, 2 ) != '//' ) {
			// Absolute path.
			if ( path.indexOf( '/' ) === 0 )
				path = location.href.match( /^.*?:\/\/[^\/]*/ )[ 0 ] + path;
			// Relative path.
			else
				path = location.href.match( /^[^\?]*\/(?:)/ )[ 0 ] + path;
		}

		if ( !path )
			throw 'The CKEditor installation path could not be automatically detected. Please set the global variable "CKEDITOR_BASEPATH" before creating editor instances.';

		return path;
	} )();

	var getUrl = function( resource ) {
		// If this is not a full or absolute path.
		if ( resource.indexOf( ':/' ) == -1 && resource.indexOf( '/' ) !== 0 )
			resource = baseUrl + resource;

		// Add the timestamp, except for directories.
		if ( this.timestamp && resource.charAt( resource.length - 1 ) != '/' && !( /[&?]t=/ ).test( resource ) )
			resource += ( resource.indexOf( '?' ) >= 0 ? '&' : '?' ) + 't=' + this.timestamp;

		return resource;
	};

	// Initialize the AMD support in the CKEditor API.
	loadScript( getUrl( 'src/lib/require/require.js' ), bootstrap );

	function bootstrap() {
		require.config( {
			baseUrl: getUrl( 'src/' )
		} );
		require( [ 'ckeditor' ], function( CKEDITOR ) {
			CKEDITOR.baseUrl = baseUrl;
			CKEDITOR.getUrl = getUrl;
			CKEDITOR.init();
		} );
	}

	// Minimal script loader implementation.
	function loadScript( path, callback ) {
		var script = document.createElement( 'script' ),
			head = document.getElementsByTagName( 'head' )[ 0 ],
			loaded;

		script.onload = script.onreadystatechange = function () {
			if ( ( script.readyState && script.readyState != 'complete' && script.readyState != 'loaded' ) || loaded ) {
				return;
			}
			script.onload = script.onreadystatechange = null;

			// Flag to avoid it being called more than once.
			loaded = 1;

			callback();
		};

		script.async = true;
		script.src = path;
		head.insertBefore( script, head.firstChild );
	}
} )();
