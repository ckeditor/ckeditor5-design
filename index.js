'use strict';

const System = require( 'systemjs' );
require( './ckeditor-loader' );

System.transpiler = 'babel';

System.config( {
	defaultJSExtensions: 'js',
} );

System.import( 'ckeditor' )
	.then( ( CKEDITORModule ) => {
		const CKEDITOR = CKEDITORModule.default;

		return CKEDITOR.create( {
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
			} );
	} )
	.catch( ( err ) => {
		console.error( err );
	} );