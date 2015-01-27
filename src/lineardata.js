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

		Object.defineProperty( this, 'length', {
			get: function() {
				return this.data.length;
			}
		} );
	}

	utils.extend( LinearData.prototype, {
		isElement: function( item ) {
			// TODO when the element shape is defined
		},

		isOpenElement: function( item ) {
			// TODO when the element shape is defined
		},

		isCloseElement: function( item ) {
			// TODO when the element shape is defined
		},

		get: function( idx ) {
			return idx !== undefined ? this.data[ idx ] : this.data;
		},

		set: function( idx, value ) {
			this.data[ idx ] = value;
		},

		push: function( value ) {
			this.data.push( value );
		},

		clone: function() {
			return this.constructor( utils.clone( this.data ), this.store );
		},

		slice: function() {
			return [].slice.apply( this.data, arguments );
		},

		splice: function() {
			return [].splice.apply( this.data, arguments );
		}


	} );

	return LinearData;
} );