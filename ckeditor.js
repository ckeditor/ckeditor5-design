// Bootstrap file for both the dev and build versions of CKEditor.
//
// 1. Figures out the "base URL" of CKEditor.
// 2. Loads RequireJS (on dev version only).
// 3. Loads (requires) the "ckeditor" module, which registers the CKEDITOR global.

'use strict';

( function() {
	// Figures out the "base URL" of CKEditor.
	var baseUrl = getBaseUrl();

	if ( !baseUrl ) {
		throw 'The CKEditor installation url could not be automatically detected.' +
			'Please set the global variable "CKEDITOR_BASEURL" before creating' +
			'editor instances.';
	}

	// On build, the following line is not needed as RequireJS is included.
	loadScript( getUrl( 'src/lib/require/require.js' ), bootstrap );			// %REMOVE_LINE%
	/*																			// %REMOVE_LINE%
	// On build, we call bootstrap straight as RequireJS is already available.
	bootstrap();
	*/																			// %REMOVE_LINE%

	// Initializes the "ckeditor" module and the CKEDITOR namespace.
	function bootstrap() {
		require.config( {														// %REMOVE_LINE%
			baseUrl: getUrl( 'src/' )											// %REMOVE_LINE%
		} );																	// %REMOVE_LINE%
		require( [ 'ckeditor' ], function( CKEDITOR ) {
			CKEDITOR.baseUrl = baseUrl;
			CKEDITOR.getUrl = getUrl;
			CKEDITOR.init();
		} );
	}

	// The same as v4.getUrl().
	function getUrl( resource ) {
		// If this is not a full or absolute path.
		if ( resource.indexOf( ':/' ) == -1 && resource.indexOf( '/' ) !== 0 )
			resource = baseUrl + resource;

		// Add the timestamp, except for directories.
		if ( this && this.timestamp && resource.charAt( resource.length - 1 ) != '/' && !( /[&?]t=/ ).test( resource ) )
			resource += ( resource.indexOf( '?' ) >= 0 ? '&' : '?' ) + 't=' + this.timestamp;

		return resource;
	}

	// The same as v4.getBasePath()		// TODO: Document the name change.
	function getBaseUrl() {
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

		return path;
	}

	// Minimal script loader implementation, used in dev only, to load RequireJS.
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
