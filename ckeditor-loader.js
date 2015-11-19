'use strict';

// ES6 modules loader customizations.
// ----------------------------------------------------------------------------

( () => {
	// Store the old normalization function.
	const systemNormalize = System.normalize;

	// Override the normalization function.
	System.normalize = function( name, parentName, parentAddress ) {
		let normalizedName = name;

		// Inject superbutton instead of a button unless asking from inside of superbutton.
		if ( normalizedName.startsWith( 'ckeditor5-button/' ) && ( !parentName || parentName.indexOf( 'ckeditor5-superbutton/' ) == -1 ) ) {
			normalizedName = normalizedName.replace( /^ckeditor5-button\//, 'ckeditor5-superbutton/' );
			console.log( `\t\tInjected ckeditor5-superbutton in place of ckeditor-button. Parent name: ${ parentName }` );
		}

		normalizedName = normalizedName
			.replace( /^ckeditor5-([^\/]+)\//, 'node_modules/ckeditor5-$1/src/' )
			.replace( /ckeditor5\//, 'src/' );

		console.log( `\t\tname: ${ name }, normalized name: ${ normalizedName }` );

		return systemNormalize.call( this, normalizedName, parentName, parentAddress )
			.then( ( url ) => {
				console.log( `\t\tnormalized name: ${ normalizedName }, resolved name: ${ url }` );

				return url;
			} );
	};
} )();