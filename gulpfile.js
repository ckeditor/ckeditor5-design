/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const plumber = require( 'gulp-plumber' );
const concat = require( 'gulp-concat-util' );
const watch = require( 'gulp-watch' );
const headerTemplate = `\n/* ----------------------- <%= file.path %> ----------------------- */\n\n`;

// gulp.task( 'sass:base', () => {
// 	const sassGlob = './src/theme-base/ckeditor.scss';

// 	return gulp.src( sassGlob )
// 		.pipe( sourcemaps.init() )
// 		.pipe( sass( {
// 			outputStyle: 'expanded'
// 		} )
// 		.on( 'error', sass.logError ) )
// 		.pipe( sourcemaps.write() )
// 		.pipe( gulp.dest( './src/theme-base/' ) );
// } );

gulp.task( 'sass', () => {
	const sassGlob = './src/ckeditor.scss';

	return gulp.src( sassGlob )
		.pipe( plumber() )
		.pipe( sourcemaps.init() )
		.pipe( sass( {
			outputStyle: 'expanded'
		} )
		.on( 'error', sass.logError ) )
		// .pipe( concat.header( headerTemplate ) )
		// .pipe( concat( 'ckeditor.css' ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './src' ) );
		// .pipe( gulp.dest( './src' ) );
} );

// gulp.task( 'default', [ 'sass:default' ] );

gulp.task( 'default', [ 'sass' ], () => {
	const sassGlob = './src/**/*.scss';

	return gulp.watch( sassGlob, [ 'sass' ] );
} );
