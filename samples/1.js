require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var foo = window.foo = new mvc.Model( {
		bar: 'bar',
		baz: true
	} );

	foo.on( 'change', function( model ) {
		console.log( 'foo changed', model );
	} );

	foo.on( 'change:bar', function( model, newValue, oldValue ) {
		console.log( 'foo.bar changed from', oldValue, 'to', newValue );
	} );

	foo.bar = 'qux';

	console.log( 'foo\'s keys:', Object.keys( foo ) );
} );