define( [ 'env' ], function( env ) {
	return {
		checkWebkit: function() {
			console.log( env.webkit ? 'I\'m on WebKit :)' : 'I\'m NOT on WebKit :(' );
		}
	};
} );
