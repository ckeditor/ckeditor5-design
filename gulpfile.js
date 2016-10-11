/* jshint browser: false, node: true, strict: true */

'use strict';

const ESDoc = require( 'esdoc' );
const gulp = require( 'gulp' );
const fs = require( 'fs' );
const path = require( 'path' );
const del = require( 'del' );
const sh = require( 'shelljs' );
const jsonStringify = require( 'json-pretty' );

gulp.task( 'default', [ 'build:all' ] );

gulp.task( 'build:all', [ 'build:esdoc:json', 'build:esdoc:html', 'build:jsdoc:html', 'build:documentationjs:json' ] );

/** Create json file using esdoc.json config */
gulp.task( 'build:esdoc:json', [ 'clean:esdoc' ], ( done ) => {
	const esdocConfig = require( './esdoc/config.json' );
	const destination = path.join( __dirname, 'esdoc', 'out-json' );
	esdocConfig.destination = destination;

	ESDoc.generate( esdocConfig, ( results, asts, config ) => {
		const json = jsonStringify( results );

		fs.mkdirSync( destination );
		fs.writeFileSync( path.join( destination, 'output.json' ), json );

		done();
	} );
} );

gulp.task( 'build:esdoc:html', [ 'clean:esdoc' ], () => {
	sh.exec( `./node_modules/.bin/esdoc -c ./esdoc/config.json` );
} );

gulp.task( 'clean:esdoc', () => {
	const destination1 = path.resolve( __dirname, 'esdoc', 'out-json' );
	const destination2 = path.resolve( __dirname, 'esdoc', 'out-html' );

	return del( destination1, destination2 );
} );

gulp.task( 'build:jsdoc:html', () => {
	return del( './jsdoc/out' )
		.then( () => {
			sh.exec( './node_modules/.bin/jsdoc -c jsdoc/config.json --debug ckeditor5 -d jsdoc/out' );
		} );
} );

gulp.task( 'clean:decumentationjs', () => {
	const { destination } = require( './documentationjs/config.json' );

	return del( destination );
} );

gulp.task( 'build:documentationjs:json' , [ 'clean:decumentationjs' ], () => {
	const { format, destination } = require( './documentationjs/config.json' );
	sh.exec( `./node_modules/.bin/documentation build ckeditor5 -f ${ format } -o ${ destination }` );
} );
