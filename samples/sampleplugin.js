CKE.define( 'plugins!sample', [], function() {
	'use strict';

	return {
		init: function( editor ) {
			console.log( 'init sample plugin for', editor );

			editor.addCommand( 'sample', function( foo ) {
				console.log( 'sample:', foo );
			} );
		}
	};
} );
