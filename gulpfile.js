/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const del = require( 'del' );
const sh = require( 'shelljs' );

gulp.task( 'default', [ 'build:all' ] );

gulp.task( 'build:all', [ 'build:documentationjs:json', 'build:documentationjs:html' ] );

gulp.task( 'clean:documentationjs', () => {
	const destination1 = path.resolve( __dirname, 'documentationjs', 'out-json' );
	const destination2 = path.resolve( __dirname, 'documentationjs', 'out-html' );

	return del( destination1, destination2 );
} );

gulp.task( 'build:documentationjs:json' , [ 'clean:documentationjs' ], () => {
	const destination = path.resolve( __dirname, 'documentationjs', 'out-json' );

	sh.exec( `./node_modules/.bin/documentation build ckeditor5/* -f json -o ${ destination }` );
} );

gulp.task( 'build:documentationjs:html' , [ 'clean:documentationjs' ], () => {
	const destination = path.resolve( __dirname, 'documentationjs', 'out-html' );

	sh.exec( `./node_modules/.bin/documentation build ckeditor5/* -f html -o ${ destination }` );
} );
