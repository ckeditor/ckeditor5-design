'use strict';

const CKEDITOR = require( './ckeditor5-cjs.js' );

CKEDITOR.create( {
	features: CKEDITOR.features
} )
.then( ( editor ) => {
	// debugger;
	console.log( 'Success!', editor );
} )
.catch( ( err ) => {
	console.error( err );
} );