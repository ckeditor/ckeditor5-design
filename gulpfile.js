/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const plumber = require( 'gulp-plumber' );
const watch = require( 'gulp-watch' );
const sprite = require( 'gulp-svg-sprite' );
const spritesConfig = {
	shape: {
		id: {
			generator: name => `ck-icon-${name.split( '.' )[ 0 ]}`
		},
	},
	svg: {
		xmlDeclaration: false,
		doctypeDeclaration: false,
	},
	mode: {
		symbol: {
			dest: '../dist',
			inline: true,
			render: {
				'js': {
					template: 'src/theme-default/components/icon-template.js',
					dest: 'js/icons.js'
				}
			}
		}
	}
};

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
	const glob = './src/theme-default/assets/*.svg';

	return gulp.src( glob )
		.pipe( sprite( spritesConfig ) )
		.pipe( gulp.dest( 'src/' ) );
} );

gulp.task( 'default', [ 'sass', 'sprites' ], () => {
	const glob = './src/**/*.{scss,svg,js}';

	return gulp.watch( glob, [ 'sass', 'sprites' ] );
} );
