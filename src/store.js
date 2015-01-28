define( [ 'tools/utils' ], function( utils ) {
	'use strict';

	function Store() {
		this.values = [];
		this.hashes = {};
	}

	// produce a "hash" of an item
	function hash( value ) {
		// TODO does the order of attributes matter? if not, then should we sort them first?
		return JSON.stringify( value );
	}

	utils.extend( Store.prototype, {
		// store a value in the store and return its index
		store: function( value ) {
			var hash = hash( value ),
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
			var hash = hash( value );

			return hash in this.hashes ? this.hashes[ hash ] : null;
		}

	} );

	return Store;
} );