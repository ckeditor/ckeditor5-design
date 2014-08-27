/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

'use strict';

// This module is a bit more complicated than others, because it is based on the
// CKEDITOR namespace, created in ../ckeditor.js. It then extends it with the
// full API.

define( [ 'env', 'tools' ], function( env, tools ) {
	var CKEDITOR = window.CKEDITOR;

	if ( CKEDITOR.status == 'unloaded' ) {
		tools.extend( CKEDITOR, {
			// Expose the CKEditor API in the namespace.
			env: env,
			tools: tools,

			// Fake fire, for demo purposes.
			fire: function ( eventName ) {
				// For now we're using the queue create in on() at ../ckeditor.js.
				// In the real implementation, on() will be replaced with the
				// real on() the the queue will be registered again and removed.
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
