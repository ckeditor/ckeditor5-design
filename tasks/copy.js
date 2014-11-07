'use strict';

var ncp = require( 'ncp' ).ncp,
	path = require( 'path' ),
	fs = require( 'fs' );

module.exports = function( grunt ) {
	grunt.registerTask( 'copy', 'Creates a deep copy of CKEditor dependencies', function() {
		var done = this.async(),
			deps = grunt.file.readJSON( 'package.json' ).dependencies,
			toCopy = Object.keys( deps ).filter( function( name ) {
				return name.indexOf( 'ckeditor-' ) === 0;
			} );

		if ( !fs.existsSync( 'tmp' ) ) {
			fs.mkdirSync( 'tmp' );
		}

		function copy() {
			var module = toCopy.shift();

			if ( !module ) {
				return done();
			}

			ncp( path.join( 'node_modules', module ), path.join( 'tmp/', module ), {
				dereference: true
			}, function( err ) {
				if ( err ) {
					return grunt.log.error( err );
				}

				copy();
			} );
		}

		copy();
	} );
};
