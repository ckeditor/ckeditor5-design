'use strict';

const gulp = require( 'gulp' );
const del = require( 'del' );
const rename = require( 'gulp-rename' );
const sourcemaps = require( 'gulp-sourcemaps' );
const babel = require( 'gulp-babel' );
const merge = require( 'merge-stream' );

gulp.task( 'clean:dist', () => {
	return del( [ './dist/amd', './dist/cjs' ] );
} );

gulp.task( 'clean:tmp', () => {
	return del( [ './.tmp' ] );
} );

gulp.task( 'copy2tmp:main', [ 'clean:tmp' ], () => {
	return gulp.src( [ './ckeditor.js', './build-file.js' ] )
		.pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'copy2tmp:ckeditor5', [ 'clean:tmp' ], () => {
	return gulp.src( './src/**' )
		.pipe( gulp.dest( './.tmp/ckeditor5' ) );
} );

gulp.task( 'copy2tmp:modules', [ 'clean:tmp' ], () => {
	return gulp.src( './node_modules/ckeditor5-*/src/**', { base: './node_modules/' } )
		.pipe( rename( ( path ) => {
			// Move files out of src/ directories.
			path.dirname = path.dirname.replace( /(ckeditor5-[^\/]+)\/src/, '/$1/' );

			// Remove now empty src/ dirs.
			if ( !path.extname && path.basename == 'src' ) {
				path.basename = '';
			}
		} ) )
		.pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'copy2tmp', [ 'copy2tmp:main', 'copy2tmp:ckeditor5', 'copy2tmp:modules' ] );

gulp.task( 'build', [ 'clean:dist', 'copy2tmp' ], () => {
	const amdStream = gulp.src( './.tmp/**/*.js' )
		.pipe( sourcemaps.init() )
		.pipe( babel( {
			plugins: [ 'transform-es2015-modules-amd' ]
		} ) )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( './dist/amd' ) );

	const cjsStream = gulp.src( './.tmp/**' )
		.pipe( babel( {
			plugins: [ 'transform-es2015-modules-commonjs' ]
		} ) )
		.pipe( gulp.dest( './dist/cjs' ) );

	return merge( amdStream, cjsStream );
} );

gulp.task( 'default', [ 'build' ] );