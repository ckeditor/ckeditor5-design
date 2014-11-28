( function ( root, factory ) {
	if ( typeof define == 'function' ) {
		define( [], factory );
	} else {
		root.CKE = factory();
	}
} )( this, function () {
