CKEDITOR.define( function() {
	'use strict';

	var plugins = {};
	var buildModules = {};

	plugins.load = function( name, req, onload, config ) {
		var path = name.split( '/' );

		path.splice( 1, 0, 'src' );

		if ( path.length === 2 ) {
			path.push( path[ 0 ] );
		}

		path = '../../ckeditor-plugin-' + path.join( '/' );

		req( [ path ], function( value ) {
			onload( value );
		} );
	};

	return plugins;
} );
