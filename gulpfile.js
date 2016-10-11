/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const del = require( 'del' );
const sh = require( 'shelljs' );

gulp.task( 'default', [ 'build:all' ] );

gulp.task( 'build:all', [ 'build:jsdoc:html' ] );

gulp.task( 'build:jsdoc:html', () => {
	return del( './jsdoc/out' )
		.then( () => {
			sh.exec( './node_modules/.bin/jsdoc -c jsdoc/config.json --debug ckeditor5 -d jsdoc/out' );
		} );
} );
