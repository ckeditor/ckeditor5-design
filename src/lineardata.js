define( [
	'store',
	'tools/utils'
], function(
	Store,
	utils
) {
	'use strict';

	function LinearData( data, store ) {
		this.data = data || [];
		this.store = store || new Store();
	}

	// prototype
	Object.defineProperty( LinearData.prototype, 'length', {
		get: function() {
			return this.data.length;
		}
	} );

	utils.extend( LinearData.prototype, {
		clone: function() {
			return this.constructor( utils.clone( this.data ), this.store );
		},

		cloneSlice: function( start, end ) {
			var data = this.slice( start, end );

			return new this.constructor( utils.clone( data ), this.store );
		},

		concat: function( data ) {
			this.data = this.data.concat( data );
		},

		get: function( idx ) {
			return idx !== undefined ? this.data[ idx ] : this.data;
		},

		push: function( value ) {
			this.data.push( value );
		},

		set: function( idx, value ) {
			this.data[ idx ] = value;
		},

		slice: function() {
			return [].slice.apply( this.data, arguments );
		},

		sliceInstance: function() {
			return new this.constructor( this.slice.apply( this, arguments ), this.store );
		},

		splice: function() {
			return [].splice.apply( this.data, arguments );
		},

		spliceArray: function( index, remove, items ) {
			return this.splice.apply( this, [ index, remove ].concat( items ) );
		}
	} );

	return LinearData;
} );