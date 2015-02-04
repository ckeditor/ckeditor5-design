define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function LinearData( data ) {
		this.data = data || [];
	}

	// static methods
	utils.extend( LinearData, {
		getType: function( item ) {
			return this.isOpenElement( item ) ? item.type : item.type.substr( 1 );
		},

		isElement: function( item ) {
			return item && utils.isString( item.type );
		},

		isOpenElement: function( item ) {
			return this.isElement( item ) && item.type.charAt( 0 ) !== '/';
		},

		isCloseElement: function( item ) {
			return this.isElement( item ) && item.type.charAt( 0 ) === '/';
		}
	} );

	// prototype
	Object.defineProperty( LinearData.prototype, 'length', {
		get: function() {
			return this.data.length;
		}
	} );

	utils.extend( LinearData.prototype, {
		isCloseElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isClosingElement( item );
		},

		isElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isElement( item );
		},

		isOpenElementAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.isOpenElement( item );
		},

		get: function( idx ) {
			return idx !== undefined ? this.data[ idx ] : this.data;
		},

		getTypeAt: function( idx ) {
			var item = this.data[ idx ];

			return item && this.constructor.getType( item );
		},

		set: function( idx, value ) {
			this.data[ idx ] = value;
		},

		push: function( value ) {
			this.data.push( value );
		},

		clone: function() {
			return this.constructor( utils.clone( this.data ) );
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