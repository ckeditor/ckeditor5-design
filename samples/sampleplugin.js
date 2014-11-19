CKE.define( 'plugins!sample', [ 'mvc/plugin' ], function( Plugin ) {
	'use strict';

	return Plugin.extend( {
		init: function() {
			console.log( 'init sample plugin for', this.editor );

			this.editor.addCommand( 'sample', function( foo ) {
				console.log( 'sample:', foo );
			} );
		}
	} );
} );
