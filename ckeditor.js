/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

// Bootstrap file for both the dev and build versions of CKEditor.
//
// 1. Defines the CKEDITOR global.
// 2. Figures out the "base URL" of CKEditor.
// 3. Loads RequireJS (on dev version only).
// 4. Loads the "ckeditor" module, initializing the API.

'use strict';

// Register the CKEDITOR global. In this file we have the "minimal" version of
// it, which can be referenced while the rest of the code is loaded.
window.CKEDITOR = {
	version: '5.0.0',
	status: 'unloaded',

	// This is a temporary on() support, so users can have a callback once the
	// API is available => CKEDITOR.on('loaded')
	on: function() {
		// For now we just queue the on() requests. They'll be registered as
		// soon as the real Event API is available.
		var queue = this._onQueue || ( this._onQueue = [] );
		queue.push( arguments );
	},

	// Same as v4.getUrl()	// TODO: review the code
	getUrl: function( resource ) {
		// If this is not a full or absolute path.
		if ( resource.indexOf( ':/' ) == -1 && resource.indexOf( '/' ) !== 0 )
			resource = this.baseUrl + resource;

		// Add the timestamp, except for directories.
		if ( this && this.timestamp && resource.charAt( resource.length - 1 ) != '/' && !( /[&?]t=/ ).test( resource ) )
			resource += ( resource.indexOf( '?' ) >= 0 ? '&' : '?' ) + 't=' + this.timestamp;

		return resource;
	},

	// Same as v4.basePath	// TODO: review the code	// TODO: document the name change
	baseUrl: ( function() {
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

		if ( !path ) {
			throw 'The CKEditor installation url could not be automatically detected.' +
				'Please set the global variable "CKEDITOR_BASEURL" before creating' +
				'editor instances.';
		}

		return path;
	} )()
};

( function() {
	// On build, the following line is not needed as RequireJS will not be needed.
	loadScript( CKEDITOR.getUrl( 'src/lib/require/require.js' ), bootstrap );	// %REMOVE_LINE%
	/*																			// %REMOVE_LINE%
	// On build, we call bootstrap straight as RequireJS is not needed.
	// Because of the building process, setTimeout is needed to ensure that
	// window.CKEDITOR is available.
	setTimeout( bootstrap, 0 );
	*/																			// %REMOVE_LINE%

	// Initialize the "ckeditor" module.
	function bootstrap() {
		// Config require to find our modules.
		require.config( {														// %REMOVE_LINE%
			baseUrl: CKEDITOR.getUrl( 'src/' )									// %REMOVE_LINE%
		} );																	// %REMOVE_LINE%

		// Require the "ckeditor" module so the API gets initialized.
		require( [ 'ckeditor' ], function( CKEDITOR ) {
			CKEDITOR.status = 'loaded';
			CKEDITOR.fire( 'loaded' );
		} );
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
