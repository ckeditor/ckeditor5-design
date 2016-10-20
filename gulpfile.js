/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const del = require( 'del' );
const buildDocs = require( './tasks/build-docs' );

gulp.task( 'default', [ 'build:docs' ] );

gulp.task( 'build:docs', () => {
	return del( './jsdoc/out' )
		.then( () => buildDocs( {
			src: 'ckeditor5/**/**',
			out: 'jsdoc/out',
		} ) );
} );
