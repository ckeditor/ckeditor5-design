requirejs.config( {
	baseUrl: '../node_modules/ckeditor-core/'
} );

require( [
	'mvc',
	'ckeditor',
	'plugins!example',
	'plugins!example/foo'
], function(
	mvc,
	ckeditor,
	ex,
	foo
) {
	console.log( mvc );
	console.log( ckeditor );
	console.log( ex );
	console.log( foo );
} );
