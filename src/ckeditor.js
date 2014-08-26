/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

'use strict';

define( [ 'env', 'tools' ], function( env, tools ) {
	var CKEDITOR = window.CKEDITOR;

	if ( CKEDITOR.status == 'unloaded' ) {
		tools.extend( CKEDITOR, {
			// Expose the CKEditor API in the namespace.
			env: env,
			tools: tools,

			// Fake fire, for demo purposes.
			fire: function ( eventName ) {
				var queue = this._onQueue;

				if ( queue ) {
					for ( var i = 0; i < queue.length; i++ ) {
						if ( queue[ i ][ 0 ] == eventName ) {
							queue[ i ][ 1 ].call( this, { name: eventName } );
						}
					}
				}
			}
		} );
	}

	return CKEDITOR;
} );
