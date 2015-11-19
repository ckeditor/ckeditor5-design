'use strict';

const System = require( 'systemjs' );
const Builder = require( 'systemjs-builder' );

System.defaultJSExtensions = 'js';

const builder = new Builder( {
	baseURL: './',

	locate( path ) {
		return System.locate( path )
			.then( ( path ) => {
				let pattern, regexp;

				pattern = `${ process.cwd() }\/ckeditor5-([^\/]+)?\/`;
				regexp = new RegExp( pattern );

				path = path.replace( regexp, `${ process.cwd() }/node_modules/ckeditor5-$1/src/` );

				pattern = `${ process.cwd() }\/ckeditor5\/`;
				regexp = new RegExp( pattern );

				path = path.replace( regexp, `${ process.cwd() }/src/` );

				console.log( pattern, path );

				return path;
			} );
	}
} );

const features = [
		'basicstyles/bold',
		'basicstyles/italic',
		'classiccreator',
		'image/imagecaption',
		'button'
	].map( ( featureName ) => {
		if ( featureName.indexOf( '/' ) == -1 ) {
			return `ckeditor5-${ featureName }/${ featureName }`;
		} else {
			return `ckeditor5-${ featureName }`;
		}
	} );

builder
	.bundle( `ckeditor.js + ${ features.join( ' + ' ) }`, 'dist/ckeditor.js' )
	.catch( ( err ) => {
		console.error( err );
	} );