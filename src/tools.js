/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

'use strict';

define( [ 'env' ], function( env ) {
	return {
		checkWebkit: function() {
			return env.webkit ? 'I\'m on WebKit :)' : 'I\'m NOT on WebKit :(';
		},

		extend: function( target ) {
			var argsLength = arguments.length,
				overwrite, propertiesList;

			if ( typeof( overwrite = arguments[ argsLength - 1 ] ) == 'boolean' )
				argsLength--;
			else if ( typeof( overwrite = arguments[ argsLength - 2 ] ) == 'boolean' ) {
				propertiesList = arguments[ argsLength - 1 ];
				argsLength -= 2;
			}
			for ( var i = 1; i < argsLength; i++ ) {
				var source = arguments[ i ];
				for ( var propertyName in source ) {
					// Only copy existed fields if in overwrite mode.
					if ( overwrite === true || target[ propertyName ] == undefined ) {
						// Only copy  specified fields if list is provided.
						if ( !propertiesList || ( propertyName in propertiesList ) )
							target[ propertyName ] = source[ propertyName ];

					}
				}
			}

			return target;
		}
	};
} );
