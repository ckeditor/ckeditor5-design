/* jshint browser: false, node: true, strict: true */

'use strict';

const ESDoc = require( 'esdoc' );
const gulp = require( 'gulp' );
const fs = require( 'fs' );
const path = require( 'path' );
const del = require( 'del' );
const sh = require( 'shelljs' );
const jsonStringify = require( 'json-pretty' );

gulp.task( 'build:all:json', [ 'build:esdoc:json', 'build:jsdoc:json', 'build:documentationjs:json' ] );

/** Create json file using esdoc.json config */
gulp.task( 'build:esdoc:json', [ 'clean:esdoc' ], ( done ) => {
	const esdocConfig = require( './esdoc/config.json' );
	const destination = path.resolve( __dirname, esdocConfig.destination );

	ESDoc.generate( esdocConfig, ( results, asts, config ) => {
		const json = jsonStringify( results );
		fs.writeFile( destination, json, err => {
			if ( err ) {
				throw err;
			}
			done();
		} );
	} );
} );

gulp.task( 'build:esdoc:html', [ 'clean:esdoc' ], () => {
	sh.exec( `esdoc -c ./esdoc/config.json` );
} );

gulp.task( 'clean:esdoc', () => {
	const esdocConfig = require( './esdoc/config.json' );
	const destination = path.resolve( __dirname, esdocConfig.destination );

	return del( destination );
} );

gulp.task( 'build:jsdoc:html', () => {
	return del( './jsdoc/out' )
		.then( () => {
			sh.exec( 'jsdoc -c jsdoc/config.json --debug ckeditor5' );
		} );
} );

gulp.task( 'clean:decumentationjs', () => {
	const { destination } = require( './documentationjs/config.json' );

	return del( destination );
} );

gulp.task( 'build:documentationjs:json' , [ 'clean:decumentationjs' ], () => {
	const { format, destination } = require( './documentationjs/config.json' );
	sh.exec( `documentation build ckeditor5 -f ${ format } -o ${ destination }` );
} );
