'use strict';

const CKEDITOR = require( './cjs/ckeditor.js' );

CKEDITOR.create( {
	features: [
		'basicstyles/bold',
		'basicstyles/italic',
		'classiccreator',
		'image/imagecaption',
		'button'
	]
} )
.then( ( editor ) => {
	// debugger;
	console.log( 'Success!', editor );
} )
.catch( ( err ) => {
	console.error( err );
} );