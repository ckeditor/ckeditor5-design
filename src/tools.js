/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

'use strict';

define( [ 'env' ], function( env ) {
	return {
		checkWebkit: function() {
			console.log( env.webkit ? 'I\'m on WebKit :)' : 'I\'m NOT on WebKit :(' );
		}
	};
} );
