require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var model = window.model = new mvc.Model( {
		text: 'text',
		baz: true
	} );

	model.on( 'change', function( model ) {
		console.log( 'model changed', model );
	} );

	model.on( 'change:text', function( model, newValue, oldValue ) {
		console.log( 'model.text changed from', oldValue, 'to', newValue );
	} );

	model.text = 'fooooo';

	console.log( 'model\'s keys:', Object.keys( model ) );
} );