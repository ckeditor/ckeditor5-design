'use strict';

const gulp = require( 'gulp' );
const del = require( 'del' );
const rename = require( 'gulp-rename' );
const rollup = require( 'rollup' );

gulp.task( 'clean:dist', () => {
	return del( [ './dist/ckeditor*' ] );
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
	return build( 'cjs' ).then( build( 'amd' ) );
} );

gulp.task( 'default', [ 'build' ] );

function build( format ) {
	return rollup.rollup( {
			entry: './.tmp/build-file.js',
			moduleId: 'ckeditor5',
			sourceMap: true
		} )
		.then( ( bundle ) => {
			bundle.write( {
				format: format,
				dest: `./dist/ckeditor5-${ format }.js`,
				sourceMap: true
			} );
		} );
}