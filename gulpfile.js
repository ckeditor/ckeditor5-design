/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const plumber = require( 'gulp-plumber' );
const watch = require( 'gulp-watch' );
const sprite = require( 'gulp-svg-sprite' );

gulp.task( 'sass', () => {
	const glob = './src/ckeditor.scss';

	return gulp.src( glob )
		.pipe( plumber() )
		.pipe( sourcemaps.init() )
		.pipe( sass( {
			outputStyle: 'expanded'
		} )
		.on( 'error', sass.logError ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'sprites', () => {
	const config = {
		mode: {
			css: {
				sprite: '../dist/assets/icon-sprite.svg',
				prefix: ".ck-icon-%s:before",
				dimensions: false,
				layout: 'vertical',
				render: {
					scss: {
						dest: './theme-default/components/icon-sprite.scss',
						template: './src/theme-default/components/icon-sprite-template.tpl',
					}
				},
				dest: '.'
			},
		}
	};

	gulp.src( './src/theme-default/assets/*.svg' )
		.pipe( sprite( config ) )
		.pipe( gulp.dest( 'src/' ) );
} );

gulp.task( 'default', [ 'sass', 'sprites' ], () => {
	const glob = './src/**/*.{scss,svg}';

	return gulp.watch( glob, [ 'sass', 'sprites' ] );
} );
