define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Store() {
		this.values = [];
		this.hashes = {};
	}

	// produce a "hash" of an item
	function makeHash( value ) {
		function sort( key, value ) {
			if ( !utils.isArray( value ) && utils.isObject( value ) ) {
				var sorted = {};

				// sort keys and fill up the sorted object
				Object.keys( value ).sort().forEach( function( key ) {
					sorted[ key ] = value[ key ];
				} );

				return sorted;
			} else {
				return value;
			}
		}

		return JSON.stringify( value, sort );
	}

	utils.extend( Store.prototype, {
		// store a value in the store and return its index
		store: function( value ) {
			var hash = makeHash( value ),
				idx = this.hashes[ hash ];

			// this is a new hash
			if ( idx === undefined ) {
				idx = this.values.push( value ) - 1;
				this.hashes[ hash ] = idx;
			}

			return idx;
		},

		// return an item on a given position
		get: function( idx ) {
			return this.values[ idx ] || null;
		},

		// return an index of a given value (if any)
		getIndex: function( value ) {
			var hash = makeHash( value );

			return hash in this.hashes ? this.hashes[ hash ] : null;
		}

	} );

	return new Store();
} );